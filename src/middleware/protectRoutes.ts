
import { jwtVerify } from 'jose';
import { redirect } from 'astro';

export async function onRequest({ request, locals }: any) {
  
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return redirect('/login'); 
  }

  const token = authHeader.replace('Bearer ', '');

  try {

    const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    locals.user = payload;

    return new Response('Protected Route Accessed'); 
  } catch (err) {

    console.error('Token verification error:', err);
    return redirect('/login');
  }
}
