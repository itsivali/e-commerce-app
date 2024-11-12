import { defineMiddleware } from 'astro:middleware';
import { pb } from './lib/pocketbase';
import { jwtVerify } from 'jose';

export const onRequest = defineMiddleware(async ({ request, locals, redirect }, next) => {
  const authCookie = request.headers.get('cookie')?.match(/pb_auth=([^;]+)/)?.[1];
  
  if (authCookie) {
    try {
      // Verify the JWT token
      const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET);
      await jwtVerify(authCookie, secret);
      
      // Set the auth data in PocketBase
      pb.authStore.save(authCookie);
      locals.user = pb.authStore.model;
    } catch (err) {
      // Invalid token
      pb.authStore.clear();
      locals.user = null;
    }
  }

  // Protect admin routes
  if (request.url.includes('/admin') && !locals.user?.admin) {
    return redirect('/login');
  }

  return next();
});