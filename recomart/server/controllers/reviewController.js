const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

const recalculateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, isApproved: true });
  const reviewCount = reviews.length;

  if (reviewCount === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = Math.round((totalRating / reviewCount) * 10) / 10;

  await Product.findByIdAndUpdate(productId, {
    rating: avgRating,
    reviewCount
  });
};

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { product: productId, isApproved: true };

    const [reviews, total, ratingStats] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'fullName avatar'),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(productId), isApproved: true } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            count1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
            count2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            count3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            count4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            count5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
          }
        }
      ])
    ]);

    const stats = ratingStats[0] || {
      averageRating: 0,
      count1: 0,
      count2: 0,
      count3: 0,
      count4: 0,
      count5: 0
    };

    const totalPages = Math.ceil(total / limitNum);

    return ApiResponse.success(res, {
      reviews,
      averageRating: Math.round((stats.averageRating || 0) * 10) / 10,
      ratingDistribution: {
        1: stats.count1,
        2: stats.count2,
        3: stats.count3,
        4: stats.count4,
        5: stats.count5
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }, 'Reviews retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, images, order: orderId } = req.body;

    if (!rating || !orderId) {
      throw ApiError.badRequest('Rating and order ID are required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      status: 'delivered'
    });

    if (!order) {
      throw ApiError.badRequest('You can only review products from your delivered orders');
    }

    const productInOrder = order.items.some(
      (item) => item.product.toString() === productId
    );

    if (!productInOrder) {
      throw ApiError.badRequest('This product is not part of the specified order');
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingReview) {
      throw ApiError.conflict('You have already reviewed this product');
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating,
      title: title || '',
      comment: comment || '',
      images: images || []
    });

    await recalculateProductRating(productId);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'fullName avatar');

    return ApiResponse.created(res, { review: populatedReview }, 'Review created successfully');
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You are not authorized to delete this review');
    }

    const productId = review.product;

    await Review.findByIdAndDelete(id);

    await recalculateProductRating(productId);

    return ApiResponse.success(res, {}, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview
};
