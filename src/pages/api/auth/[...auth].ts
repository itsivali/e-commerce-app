import { defineConfig } from 'auth-astro/config';
import Credentials from '@auth/core/providers/credentials';
import { pb } from '../../../lib/pocketbase';

export const authConfig = defineConfig({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
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
    })
  ],
  secret: import.meta.env.JWT_SECRET,
  trustHost: true
});