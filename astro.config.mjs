import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import auth from 'auth-astro';
import node from '@astrojs/node';
import { onRequest } from './src/middleware'; // Import middleware function

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    auth({
      providers: [
        {
          type: 'credentials',
          name: 'Credentials',
          credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' }
          },
          async authorize(credentials) {
            // Implement your authentication logic here
            try {
              const pb = new PocketBase(import.meta.env.POCKETBASE_URL);
              const authData = await pb.collection('users').authWithPassword(
                credentials.email,
                credentials.password
              );
              
              if (authData.record) {
                return {
                  id: authData.record.id,
                  email: authData.record.email,
                  name: authData.record.name
                };
              }
              return null;
            } catch (error) {
              console.error('Auth error:', error);
              return null;
            }
          }
        }
      ]
    })
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone',
      server: {
      middleware: [onRequest] 
    }
  })
});
