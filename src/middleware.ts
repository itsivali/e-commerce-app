import { pb } from './lib/pocketbase';
import { jwtVerify } from 'jose';

export async function onRequest({ request, locals, redirect }: any) {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Use specific domain if needed, e.g., 'https://yourdomain.com'
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Handle preflight CORS requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Add CORS headers to the response for non-preflight requests
  const response = await fetch(request);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Authentication logic
  const authCookie = request.headers.get('cookie')?.match(/pb_auth=([^;]+)/)?.[1];
  
  let user = null;
  if (authCookie) {
    try {
      // Verify the JWT token
      const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET);
      await jwtVerify(authCookie, secret);
      
      // Set the auth data in PocketBase
      pb.authStore.save(authCookie);
      user = pb.authStore.model;
    } catch (err) {
      // Invalid token
      pb.authStore.clear();
      user = null;
    }
  }

  // Protect admin routes
  if (request.url.includes('/admin') && !user?.admin) {
    return redirect('/login');
  }

  // Attach user to the response context (locals can't be mutated)
  response.headers.set('x-user', JSON.stringify(user)); // Or use another method to pass the user

  return response;
}
