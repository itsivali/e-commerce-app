import type { APIRoute } from 'astro';
import { pb } from '../../../lib/pocketbase';
import { initiateSTKPush } from '../../../lib/mpesa';
import { getSession } from 'auth-astro/client';

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await getSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { phone, amount } = await request.json();

    // Validate phone number format
    if (!/^254[0-9]{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }), 
        { status: 400 }
      );
    }

    // Initiate M-Pesa payment
    const response = await initiateSTKPush(phone, amount);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return new Response(
      JSON.stringify({ error: 'Payment initiation failed' }), 
      { status: 500 }
    );
  }
}