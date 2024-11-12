import { defineMiddleware } from 'astro:middleware';
import { pb } from './lib/pocketbase';
import { jwtVerify } from 'jose';
import type { Locals } from './types.d.ts'; // Import the Locals type

export const onRequest = defineMiddleware(async ({ request, locals, redirect }, next) => {
  // Cast locals to our custom type
  const typedLocals = locals as Locals;

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
  const response = await next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Authentication
  const authCookie = request.headers.get('cookie')?.match(/pb_auth=([^;]+)/)?.[1];
  
  if (authCookie) {
    try {
      // Verify the JWT token
      const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET);
      await jwtVerify(authCookie, secret);
      
      // Set the auth data in PocketBase
      pb.authStore.save(authCookie);
      typedLocals.user = pb.authStore.model;
    } catch (err) {
      // Invalid token
      pb.authStore.clear();
      typedLocals.user = null;
    }
  }

  // Protect admin routes
  if (request.url.includes('/admin') && !typedLocals.user?.admin) {
    return redirect('/login');
  }

  return response;
});
