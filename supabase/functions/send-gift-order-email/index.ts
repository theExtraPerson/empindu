import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GiftEmailRequest {
  giftOrderId: string;
  newStatus: string;
}

const statusMessages: Record<string, { emoji: string; title: string; body: string }> = {
  reviewed: {
    emoji: "👀",
    title: "Your Gift Order is Being Reviewed",
    body: "Our team has reviewed your corporate gift order and is preparing a detailed plan. We'll be in touch shortly to confirm the details.",
  },
  confirmed: {
    emoji: "✅",
    title: "Gift Order Confirmed!",
    body: "Great news! Your corporate gift order has been confirmed. Our artisans are getting ready to craft your gifts with care.",
  },
  in_production: {
    emoji: "🎨",
    title: "Your Gifts Are Being Crafted",
    body: "Our talented artisans have started creating your gifts. Each piece is handcrafted with attention to detail and cultural significance.",
  },
  shipped: {
    emoji: "📦",
    title: "Your Gift Order Has Shipped!",
    body: "Your corporate gifts are on their way! Recipients will receive their handcrafted gifts soon.",
  },
  delivered: {
    emoji: "🎉",
    title: "Gifts Delivered Successfully!",
    body: "All gifts from your corporate order have been delivered. We hope your recipients love their handcrafted Ugandan treasures!",
  },
  cancelled: {
    emoji: "❌",
    title: "Gift Order Cancelled",
    body: "Your corporate gift order has been cancelled. If you have any questions or would like to place a new order, please don't hesitate to reach out.",
  },
};

const buildEmailHtml = (
  contactName: string,
  companyName: string,
  orderId: string,
  status: string,
  recipientCount: number,
  occasion: string | null,
  deliveryDate: string | null,
) => {
  const info = statusMessages[status] || {
    emoji: "📋",
    title: "Gift Order Update",
    body: "Your corporate gift order status has been updated.",
  };

  const shortId = orderId.slice(0, 8).toUpperCase();

  return {
    subject: `${info.emoji} Corporate Gift Order #${shortId} — ${info.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D4A574 0%, #8B4513 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">${info.emoji} ${info.title}</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Corporate Gifting</p>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #333;">Dear ${contactName},</p>
          <p style="color: #666; line-height: 1.6;">${info.body}</p>

          <div style="background: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px;">Order ID</td>
                <td style="padding: 6px 0; color: #333; font-weight: bold; text-align: right;">#${shortId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px;">Company</td>
                <td style="padding: 6px 0; color: #333; text-align: right;">${companyName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px;">Status</td>
                <td style="padding: 6px 0; color: #8B4513; font-weight: bold; text-align: right; text-transform: capitalize;">${status.replace("_", " ")}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px;">Recipients</td>
                <td style="padding: 6px 0; color: #333; text-align: right;">${recipientCount}</td>
              </tr>
              ${occasion ? `<tr><td style="padding: 6px 0; color: #888; font-size: 13px;">Occasion</td><td style="padding: 6px 0; color: #333; text-align: right; text-transform: capitalize;">${occasion}</td></tr>` : ""}
              ${deliveryDate ? `<tr><td style="padding: 6px 0; color: #888; font-size: 13px;">Delivery Date</td><td style="padding: 6px 0; color: #333; text-align: right;">${deliveryDate}</td></tr>` : ""}
            </table>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 20px;">If you have any questions about your order, simply reply to this email or contact our team.</p>
          <p style="color: #8B4513; font-weight: bold;">Thank you for choosing Ugandan Crafts for your corporate gifts! 🇺🇬</p>
        </div>
      </div>
    `,
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = claimsData.claims.sub;

    // Verify admin role
    const { data: userRole } = await supabase.rpc("get_user_role", { _user_id: userId });
    if (userRole !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { giftOrderId, newStatus }: GiftEmailRequest = await req.json();
    if (!giftOrderId || !newStatus) {
      return new Response(JSON.stringify({ error: "Missing giftOrderId or newStatus" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch the gift order
    const { data: order, error: orderError } = await supabase
      .from("corporate_gift_orders")
      .select("*")
      .eq("id", giftOrderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Gift order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { subject, html } = buildEmailHtml(
      order.contact_name,
      order.company_name,
      order.id,
      newStatus,
      order.recipient_count,
      order.occasion,
      order.delivery_date,
    );

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ugandan Crafts <onboarding@resend.dev>",
        to: [order.contact_email],
        subject,
        html,
      }),
    });

    const emailResponse = await res.json();
    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Gift order email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-gift-order-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
