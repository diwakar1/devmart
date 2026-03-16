import nodemailer from 'nodemailer';
import config from '../config';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (config.email.host && config.email.user && config.email.password) {
    // Use configured SMTP (e.g. Gmail, SendGrid, Mailgun)
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  } else {
    // Dev mode: use Ethereal fake SMTP (emails viewable at https://ethereal.email)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Using Ethereal test email account:', testAccount.user);
  }

  return transporter;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { product_name: string; quantity: number; unit_price: string | number }[];
  subtotal: string | number;
  taxAmount: string | number;
  shippingAmount: string | number;
  discountAmount: string | number;
  totalAmount: string | number;
  paymentMethod: string;
  paymentStatus: string;
  trackingUrl: string;
}

function buildOrderConfirmationHtml(data: OrderEmailData): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee">${item.product_name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">$${Number(item.unit_price).toFixed(2)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">$${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const paymentLabel: Record<string, string> = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    paypal: 'PayPal',
    cash_on_delivery: 'Cash on Delivery',
  };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    
    <!-- Header -->
    <div style="background:#4f46e5;padding:30px 40px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">Order Confirmed!</h1>
      <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px">Thank you for your purchase, ${data.customerName}</p>
    </div>

    <!-- Order Number -->
    <div style="padding:24px 40px;text-align:center;background:#f8fafc;border-bottom:1px solid #e2e8f0">
      <p style="margin:0;color:#64748b;font-size:13px">ORDER NUMBER</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#1e293b;letter-spacing:1px">${data.orderNumber}</p>
    </div>

    <!-- Items Table -->
    <div style="padding:24px 40px">
      <h2 style="margin:0 0 16px;font-size:16px;color:#334155">Order Details</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:10px 12px;text-align:left;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Item</th>
            <th style="padding:10px 12px;text-align:center;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Qty</th>
            <th style="padding:10px 12px;text-align:right;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Price</th>
            <th style="padding:10px 12px;text-align:right;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="margin-top:16px;border-top:2px solid #e2e8f0;padding-top:12px;font-size:14px">
        <div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#64748b">Subtotal</span><span>$${Number(data.subtotal).toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#64748b">Tax</span><span>$${Number(data.taxAmount).toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#64748b">Shipping</span><span>${Number(data.shippingAmount) > 0 ? '$' + Number(data.shippingAmount).toFixed(2) : 'Free'}</span></div>
        ${Number(data.discountAmount) > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#16a34a">Discount</span><span style="color:#16a34a">-$${Number(data.discountAmount).toFixed(2)}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;padding:8px 0;margin-top:8px;border-top:2px solid #1e293b;font-size:18px;font-weight:bold">
          <span>Total</span><span>$${Number(data.totalAmount).toFixed(2)}</span>
        </div>
      </div>

      <!-- Payment & Status -->
      <div style="margin-top:16px;padding:12px 16px;background:#f8fafc;border-radius:6px;font-size:13px;color:#64748b">
        <strong>Payment:</strong> ${paymentLabel[data.paymentMethod] || data.paymentMethod}
        &nbsp;•&nbsp;
        <strong>Status:</strong> <span style="color:${data.paymentStatus === 'paid' ? '#16a34a' : '#f59e0b'}">${data.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>
      </div>
    </div>

    <!-- Track Order Button -->
    <div style="padding:16px 40px 32px;text-align:center">
      <a href="${data.trackingUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600">
        Track Your Order
      </a>
      <p style="margin:12px 0 0;font-size:12px;color:#94a3b8">Click the button above to check your order status anytime</p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="margin:0;font-size:12px;color:#94a3b8">&copy; 2026 DevMart. All rights reserved.</p>
      <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1">This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: `"DevMart" <${config.email.from}>`,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html: buildOrderConfirmationHtml(data),
    });

    // In dev mode with Ethereal, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Email preview: ${previewUrl}`);
    } else {
      console.log(`📧 Order confirmation email sent to ${data.customerEmail}`);
    }
  } catch (err) {
    // Don't let email failure break the order flow
    console.error('📧 Failed to send order confirmation email:', err);
  }
}
