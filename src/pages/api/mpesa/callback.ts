import type { APIRoute } from 'astro';
import { pb } from '../../../lib/pocketbase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Verify the callback data
    if (data.Body.stkCallback.ResultCode === 0) {
      const orderId = data.Body.stkCallback.MerchantRequestID;
      
      // Update order status in PocketBase
      await pb.collection('orders').update(orderId, {
        status: 'paid',
        mpesaReference: data.Body.stkCallback.CheckoutRequestID
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({ success: false }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}