import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderEmailRequest {
  type: 'confirmation' | 'status_update' | 'shipped';
  email: string;
  customerName: string;
  orderId: string;
  orderTotal?: number;
  items?: OrderItem[];
  shippingAddress?: string;
  newStatus?: string;
  trackingInfo?: string;
}

const getEmailContent = (data: OrderEmailRequest) => {
  const { type, customerName, orderId, orderTotal, items, shippingAddress, newStatus, trackingInfo } = data;
  
  const shortOrderId = orderId.slice(0, 8).toUpperCase();
  
  switch (type) {
    case 'confirmation':
      const itemsHtml = items?.map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">UGX ${item.price.toLocaleString()}</td>
        </tr>
      `).join('') || '';
      
      return {
        subject: `Order Confirmed - #${shortOrderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #D4A574 0%, #8B4513 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Order Confirmed!</h1>
            </div>
            <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; color: #333;">Dear ${customerName},</p>
              <p style="color: #666;">Thank you for supporting Ugandan artisans! Your order has been confirmed and is being prepared.</p>
              
              <div style="background: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #8B4513; font-weight: bold;">Order #${shortOrderId}</p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 12px; text-align: left;">Item</th>
                    <th style="padding: 12px; text-align: center;">Qty</th>
                    <th style="padding: 12px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 12px; font-weight: bold;">Total</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; color: #8B4513;">UGX ${orderTotal?.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div style="background: #f9f5f0; padding: 15px; border-radius: 8px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #333;">Shipping to:</p>
                <p style="margin: 0; color: #666;">${shippingAddress}</p>
              </div>
              
              <p style="color: #666; margin-top: 20px;">We'll send you another email when your order ships.</p>
              <p style="color: #8B4513; font-weight: bold;">Thank you for choosing Ugandan Crafts! 🇺🇬</p>
            </div>
          </div>
        `,
      };
      
    case 'status_update':
      const statusEmoji: Record<string, string> = {
        confirmed: '✅',
        processing: '⚙️',
        shipped: '📦',
        delivered: '🎉',
        cancelled: '❌',
      };
      
      return {
        subject: `Order Update - #${shortOrderId} is now ${newStatus}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #D4A574 0%, #8B4513 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${statusEmoji[newStatus || ''] || '📋'} Order Status Update</h1>
            </div>
            <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; color: #333;">Dear ${customerName},</p>
              <p style="color: #666;">Your order status has been updated.</p>
              
              <div style="background: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #666;">Order #${shortOrderId}</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #8B4513; text-transform: capitalize;">${newStatus}</p>
              </div>
              
              ${newStatus === 'shipped' ? `
                <p style="color: #666;">Your order is on its way! You'll receive it soon.</p>
              ` : newStatus === 'delivered' ? `
                <p style="color: #666;">Your order has been delivered. We hope you love your handcrafted items!</p>
              ` : newStatus === 'cancelled' ? `
                <p style="color: #666;">Your order has been cancelled. If you have any questions, please contact our support team.</p>
              ` : `
                <p style="color: #666;">We're working on your order. We'll keep you updated!</p>
              `}
              
              <p style="color: #8B4513; font-weight: bold; margin-top: 20px;">Thank you for your patience! 🇺🇬</p>
            </div>
          </div>
        `,
      };
      
    case 'shipped':
      return {
        subject: `Your Order #${shortOrderId} Has Shipped! 📦`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #D4A574 0%, #8B4513 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📦 Your Order Has Shipped!</h1>
            </div>
            <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; color: #333;">Dear ${customerName},</p>
              <p style="color: #666;">Great news! Your order is on its way to you.</p>
              
              <div style="background: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #666;">Order #${shortOrderId}</p>
                ${trackingInfo ? `<p style="margin: 0; color: #8B4513; font-weight: bold;">Tracking: ${trackingInfo}</p>` : ''}
              </div>
              
              <div style="background: #f9f5f0; padding: 15px; border-radius: 8px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #333;">Shipping to:</p>
                <p style="margin: 0; color: #666;">${shippingAddress}</p>
              </div>
              
              <p style="color: #666; margin-top: 20px;">Your handcrafted items will arrive soon. Thank you for supporting Ugandan artisans!</p>
              <p style="color: #8B4513; font-weight: bold;">Happy shopping! 🇺🇬</p>
            </div>
          </div>
        `,
      };
      
    default:
      return { subject: 'Order Update', html: '<p>Order update notification</p>' };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send-order-email");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderEmailRequest = await req.json();
    console.log("Email request data:", { type: data.type, email: data.email, orderId: data.orderId });

    if (!data.email || !data.orderId || !data.type) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, orderId, type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { subject, html } = getEmailContent(data);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ugandan Crafts <onboarding@resend.dev>",
        to: [data.email],
        subject,
        html,
      }),
    });

    const emailResponse = await res.json();
    
    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
