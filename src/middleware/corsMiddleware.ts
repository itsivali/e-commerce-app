import { pb } from '../lib/pocketbase';
import { jwtVerify } from 'jose';
import { redirect } from 'astro';

export async function onRequest({ request, locals, redirect }: any) {

    const corsHeaders = {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  const response = await fetch(request);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  const authCookie = request.headers.get('cookie')?.match(/pb_auth=([^;]+)/)?.[1];
  
  if (authCookie) {
    try {

      const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET);
      await jwtVerify(authCookie, secret);
      
      pb.authStore.save(authCookie);
      locals.user = pb.authStore.model;
    } catch (err) {

      pb.authStore.clear();
      locals.user = null;
    }
  }

  if (request.url.includes('/admin') && !locals.user?.admin) {
    return redirect('/login');
  }

  return response;
}
