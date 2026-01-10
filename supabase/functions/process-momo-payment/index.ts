import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  orderId: string;
  amount: number;
  phoneNumber: string;
  provider: 'mtn' | 'airtel';
  customerName: string;
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

    const { orderId, amount, phoneNumber, provider, customerName }: PaymentRequest = await req.json();

    console.log(`Processing ${provider.toUpperCase()} payment for order ${orderId}`);
    console.log(`Amount: ${amount}, Phone: ${phoneNumber}`);

    // Validate phone number format for Uganda
    const phoneRegex = /^(?:\+256|0)?[7][0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number to international format
    let normalizedPhone = phoneNumber.replace(/\s/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+256' + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+256' + normalizedPhone;
    }

    // Generate a unique transaction reference
    const transactionRef = `CU-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        amount: amount,
        provider: provider,
        phone_number: normalizedPhone,
        transaction_ref: transactionRef,
        status: 'pending',
        customer_name: customerName
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError);
      throw new Error('Failed to initiate payment');
    }

    // TODO: Integrate with actual MTN MoMo or Airtel Money API
    // For now, we simulate the payment request
    // 
    // MTN MoMo API flow:
    // 1. Get access token from /token endpoint
    // 2. Create payment request to /requesttopay endpoint
    // 3. Check payment status from /requesttopay/{referenceId} endpoint
    //
    // Airtel Money API flow:
    // 1. Get OAuth token from /auth/oauth2/token
    // 2. Initiate payment to /merchant/v1/payments/
    // 3. Check status from /standard/v1/payments/{id}

    let apiResponse;
    
    if (provider === 'mtn') {
      // MTN MoMo integration placeholder
      console.log('MTN MoMo payment request initiated');
      apiResponse = {
        success: true,
        message: 'Payment request sent to your phone. Please enter your PIN to confirm.',
        referenceId: transactionRef,
        provider: 'MTN Mobile Money'
      };
    } else if (provider === 'airtel') {
      // Airtel Money integration placeholder
      console.log('Airtel Money payment request initiated');
      apiResponse = {
        success: true,
        message: 'Payment request sent to your phone. Please enter your PIN to confirm.',
        referenceId: transactionRef,
        provider: 'Airtel Money'
      };
    }

    // Update payment status to processing
    await supabase
      .from('payments')
      .update({ status: 'processing' })
      .eq('id', payment.id);

    // Simulate successful payment after a delay (for demo purposes)
    // In production, this would be handled by a webhook from the payment provider
    EdgeRuntime.waitUntil((async () => {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      
      // Update payment to completed
      await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      // Update order status to confirmed
      await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId);

      console.log(`Payment ${transactionRef} completed successfully`);
    })());

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: payment.id,
        transactionRef: transactionRef,
        message: apiResponse.message,
        provider: apiResponse.provider
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
