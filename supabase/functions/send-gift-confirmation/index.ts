import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GiftConfirmationRequest {
  giftOrderId: string;
}

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

    const { giftOrderId }: GiftConfirmationRequest = await req.json();
    if (!giftOrderId) {
      return new Response(JSON.stringify({ error: "Missing giftOrderId" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch gift order — RLS ensures only the owner can read it
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

    // Verify ownership
    if (order.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch items
    const { data: items } = await supabase
      .from("corporate_gift_items")
      .select("quantity, unit_price, product_id, personalization")
      .eq("gift_order_id", giftOrderId);

    // Fetch product names for items
    let itemsWithNames: { name: string; quantity: number; price: number }[] = [];
    if (items && items.length > 0) {
      const productIds = items.map((i) => i.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);

      const productMap = new Map(products?.map((p) => [p.id, p.name]) || []);
      itemsWithNames = items.map((i) => ({
        name: productMap.get(i.product_id) || "Gift Item",
        quantity: i.quantity,
        price: i.unit_price,
      }));
    }

    // Fetch recipients
    const { data: recipients } = await supabase
      .from("corporate_gift_recipients")
      .select("name, city")
      .eq("gift_order_id", giftOrderId);

    const shortId = giftOrderId.slice(0, 8).toUpperCase();
    const totalAmount = itemsWithNames.reduce((sum, i) => sum + i.quantity * i.price, 0);

    const itemRows = itemsWithNames
      .map(
        (i) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">UGX ${(i.price * i.quantity).toLocaleString()}</td>
      </tr>`
      )
      .join("");

    const recipientList = recipients
      ?.map((r) => `<li style="color: #555; padding: 4px 0;">${r.name}${r.city ? ` — ${r.city}` : ""}</li>`)
      .join("") || "";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D4A574 0%, #8B4513 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">🎁 Gift Order Submitted!</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Order #${shortId}</p>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #333;">Dear ${order.contact_name},</p>
          <p style="color: #666; line-height: 1.6;">Thank you for submitting your gift order${order.company_name ? ` on behalf of <strong>${order.company_name}</strong>` : ""}! Our team will review it and contact you within 24 hours to confirm the details.</p>

          <div style="background: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px;">Order ID</td>
                <td style="padding: 6px 0; color: #333; font-weight: bold; text-align: right;">#${shortId}</td>
              </tr>
              ${order.occasion ? `<tr><td style="padding: 6px 0; color: #888; font-size: 13px;">Occasion</td><td style="padding: 6px 0; color: #333; text-align: right; text-transform: capitalize;">${order.occasion}</td></tr>` : ""}
              ${order.delivery_date ? `<tr><td style="padding: 6px 0; color: #888; font-size: 13px;">Delivery Date</td><td style="padding: 6px 0; color: #333; text-align: right;">${order.delivery_date}</td></tr>` : ""}
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px;">Recipients</td>
                <td style="padding: 6px 0; color: #333; text-align: right;">${order.recipient_count}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px;">Status</td>
                <td style="padding: 6px 0; color: #8B4513; font-weight: bold; text-align: right;">Pending Review</td>
              </tr>
            </table>
          </div>

          ${itemRows ? `
          <h3 style="color: #333; font-size: 15px; margin: 20px 0 10px;">Gift Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead><tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left; font-size: 13px;">Item</th>
              <th style="padding: 10px; text-align: center; font-size: 13px;">Qty</th>
              <th style="padding: 10px; text-align: right; font-size: 13px;">Subtotal</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
            <tfoot><tr>
              <td colspan="2" style="padding: 10px; font-weight: bold;">Estimated Total</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #8B4513;">UGX ${totalAmount.toLocaleString()}</td>
            </tr></tfoot>
          </table>` : ""}

          ${recipientList ? `
          <h3 style="color: #333; font-size: 15px; margin: 20px 0 10px;">Recipients</h3>
          <ul style="margin: 0; padding-left: 20px;">${recipientList}</ul>` : ""}

          ${order.gift_message ? `
          <div style="background: #fef9f3; padding: 15px; border-left: 4px solid #D4A574; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 4px; font-weight: bold; color: #8B4513; font-size: 13px;">Gift Message</p>
            <p style="margin: 0; color: #555; font-style: italic;">"${order.gift_message}"</p>
          </div>` : ""}

          <p style="color: #666; font-size: 14px; margin-top: 24px;">If you have any questions, simply reply to this email or contact our team.</p>
          <p style="color: #8B4513; font-weight: bold;">Thank you for choosing Ugandan Crafts for your gifts! 🇺🇬</p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ugandan Crafts <onboarding@resend.dev>",
        to: [order.contact_email],
        subject: `🎁 Gift Order #${shortId} — Submitted Successfully!`,
        html,
      }),
    });

    const emailResponse = await res.json();
    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Gift confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-gift-confirmation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
