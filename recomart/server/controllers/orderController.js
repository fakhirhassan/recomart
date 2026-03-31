const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const emailService = require('../services/emailService');

const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country) {
      throw ApiError.badRequest('Shipping address with street, city, and country is required');
    }

    if (paymentMethod && !['stripe', 'cod'].includes(paymentMethod)) {
      throw ApiError.badRequest('Payment method must be either "stripe" or "cod"');
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'vendor', select: '_id' }
    });

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        throw ApiError.badRequest('One or more products in your cart no longer exist');
      }

      if (!product.isApproved || !product.isActive) {
        throw ApiError.badRequest(`Product "${product.title}" is no longer available`);
      }

      if (product.stockQuantity < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for "${product.title}". Available: ${product.stockQuantity}`
        );
      }

      const primaryImage = product.images.find((img) => img.isPrimary);
      const image = primaryImage ? primaryImage.url : (product.images[0] ? product.images[0].url : '');

      orderItems.push({
        product: product._id,
        vendor: product.vendor._id || product.vendor,
        title: product.title,
        image,
        price: product.price,
        quantity: item.quantity
      });

      subtotal += product.price * item.quantity;
    }

    const shippingFee = subtotal > 5000 ? 0 : 200;
    const discount = 0;
    const totalAmount = subtotal + shippingFee - discount;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'stripe',
      subtotal,
      shippingFee,
      discount,
      totalAmount,
      notes: notes || ''
    });

    // Clear the cart
    cart.items = [];
    await cart.save();

    // Create notification for each unique vendor
    const vendorIds = [...new Set(orderItems.map((item) => item.vendor.toString()))];
    const notificationPromises = vendorIds.map((vendorId) =>
      Notification.create({
        user: vendorId,
        title: 'New Order Received',
        message: `You have a new order #${order._id.toString().slice(-8)}`,
        type: 'order',
        link: `/seller/orders/${order._id}`
      })
    );
    await Promise.all(notificationPromises);

    // If COD, update inventory immediately
    if (paymentMethod === 'cod') {
      const inventoryUpdates = orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: -item.quantity, totalSold: item.quantity }
        })
      );
      await Promise.all(inventoryUpdates);
    }

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation(req.user.email, order);
    } catch (emailError) {
      // Email failure should not block order creation
      console.error('Failed to send order confirmation email:', emailError.message);
    }

    return ApiResponse.created(res, { order }, 'Order created successfully');
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { user: req.user._id };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return ApiResponse.success(res, {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }, 'Orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('user', 'fullName email');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to view this order');
    }

    return ApiResponse.success(res, { order }, 'Order retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You are not authorized to cancel this order');
    }

    if (order.status !== 'pending') {
      throw ApiError.badRequest('Only pending orders can be cancelled');
    }

    order.status = 'cancelled';
    order.cancelReason = cancelReason || '';
    await order.save();

    // If COD, restore inventory since it was decremented at order creation
    if (order.paymentMethod === 'cod') {
      const inventoryUpdates = order.items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity, totalSold: -item.quantity }
        })
      );
      await Promise.all(inventoryUpdates);
    }

    return ApiResponse.success(res, { order }, 'Order cancelled successfully');
  } catch (error) {
    next(error);
  }
};

const getSellerOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { 'items.vendor': req.user._id };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'fullName email'),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return ApiResponse.success(res, {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }, 'Seller orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      throw ApiError.badRequest(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await Order.findById(id).populate('user', 'fullName email');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Verify that the seller owns at least one item in this order
    const sellerHasItems = order.items.some(
      (item) => item.vendor.toString() === req.user._id.toString()
    );

    if (!sellerHasItems) {
      throw ApiError.forbidden('You are not authorized to update this order');
    }

    order.status = status;

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Send status update email to customer
    try {
      await emailService.sendOrderStatusUpdate(order.user.email, order._id, status);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError.message);
    }

    // Create notification for the customer
    await Notification.create({
      user: order.user._id,
      title: 'Order Status Updated',
      message: `Your order #${order._id.toString().slice(-8)} has been updated to "${status}"`,
      type: 'order',
      link: `/orders/${order._id}`
    });

    return ApiResponse.success(res, { order }, 'Order status updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getSellerOrders,
  updateOrderStatus
};
