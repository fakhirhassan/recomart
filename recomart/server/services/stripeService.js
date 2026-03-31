const stripe = require('../config/stripe');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');

class StripeService {
  async createCheckoutSession(order, user) {
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'pkr',
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : []
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));

    if (order.shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'pkr',
          product_data: { name: 'Shipping Fee' },
          unit_amount: Math.round(order.shippingFee * 100)
        },
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: lineItems,
      metadata: { orderId: order._id.toString() },
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL
    });

    return session;
  }

  async handleWebhook(payload, signature) {
    const event = stripe.webhooks.constructEvent(
      payload, signature, process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata.orderId;

      const order = await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        status: 'confirmed',
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent
      }, { new: true });

      if (order) {
        await Payment.create({
          order: orderId,
          user: order.user,
          provider: 'stripe',
          stripePaymentIntentId: session.payment_intent,
          amount: session.amount_total / 100,
          status: 'completed'
        });

        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: -item.quantity, totalSold: item.quantity }
          });
        }
      }
    }

    return event;
  }

  async verifySession(sessionId) {
    return stripe.checkout.sessions.retrieve(sessionId);
  }
}

module.exports = new StripeService();
