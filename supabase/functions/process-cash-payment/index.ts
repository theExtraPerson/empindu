import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CashPaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: string;
  pickupLocationId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      orderId, 
      amount, 
      customerName, 
      customerPhone,
      deliveryMethod,
      deliveryAddress,
      pickupLocationId
    }: CashPaymentRequest = await req.json();

    console.log(`Processing cash on delivery payment for order ${orderId}`);

    // Generate a unique transaction reference
    const transactionRef = `COD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create payment record for cash on delivery
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        amount: amount,
        provider: 'cash',
        phone_number: customerPhone,
        transaction_ref: transactionRef,
        status: 'pending_collection', // Cash will be collected on delivery
        customer_name: customerName
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError);
      throw new Error('Failed to process cash payment');
    }

    // Update order status to confirmed (for cash orders, they're confirmed immediately)
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', orderId);

    if (orderError) {
      console.error('Failed to update order status:', orderError);
    }

    // Get pickup location details if applicable
    let pickupDetails = null;
    if (deliveryMethod === 'pickup' && pickupLocationId) {
      const { data: location } = await supabase
        .from('pickup_locations')
        .select('name, address, city, operating_hours')
        .eq('id', pickupLocationId)
        .single();
      
      pickupDetails = location;
    }

    const responseMessage = deliveryMethod === 'pickup'
      ? `Your order has been confirmed. Please pay ${amount.toLocaleString()} UGX in cash when you pick up your order${pickupDetails ? ` at ${pickupDetails.name}` : ''}.`
      : `Your order has been confirmed. Please have ${amount.toLocaleString()} UGX ready for the delivery person.`;

    console.log(`Cash payment ${transactionRef} created successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: payment.id,
        transactionRef: transactionRef,
        message: responseMessage,
        deliveryMethod: deliveryMethod,
        pickupDetails: pickupDetails,
        amountDue: amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cash payment processing error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
