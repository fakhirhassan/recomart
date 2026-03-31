const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: `"RecoMart" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });
    } catch (error) {
      console.error('Email send error:', error.message);
    }
  }

  async sendOrderConfirmation(email, order) {
    const itemsList = order.items.map(i =>
      `<li>${i.title} x${i.quantity} - PKR ${i.price * i.quantity}</li>`
    ).join('');

    await this.sendEmail(email, `Order Confirmed - #${order._id.toString().slice(-8)}`, `
      <h2>Order Confirmed!</h2>
      <p>Thank you for your order. Here are the details:</p>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <ul>${itemsList}</ul>
      <p><strong>Total:</strong> PKR ${order.totalAmount}</p>
      <p><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid via Stripe'}</p>
      <p>We'll notify you when your order ships.</p>
      <p>— RecoMart Team</p>
    `);
  }

  async sendOrderStatusUpdate(email, orderId, status) {
    await this.sendEmail(email, `Order Update - #${orderId.toString().slice(-8)}`, `
      <h2>Order Status Updated</h2>
      <p>Your order <strong>#${orderId.toString().slice(-8)}</strong> status has been updated to: <strong>${status}</strong></p>
      <p>Visit your orders page for more details.</p>
      <p>— RecoMart Team</p>
    `);
  }

  async sendSellerApproval(email, businessName, approved) {
    const subject = approved ? 'Seller Account Approved!' : 'Seller Application Update';
    const message = approved
      ? `<p>Congratulations! Your seller account <strong>${businessName}</strong> has been approved. You can now start listing products.</p>`
      : `<p>We regret to inform you that your seller application for <strong>${businessName}</strong> has been rejected. Please contact support for more information.</p>`;

    await this.sendEmail(email, subject, `<h2>${subject}</h2>${message}<p>— RecoMart Team</p>`);
  }

  async sendWelcomeEmail(email, name) {
    await this.sendEmail(email, 'Welcome to RecoMart!', `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for joining RecoMart. Start exploring amazing products at great prices.</p>
      <p>— RecoMart Team</p>
    `);
  }
}

module.exports = new EmailService();
