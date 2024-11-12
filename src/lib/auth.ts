import { pb } from './pocketbase';

export async function signIn(email: string, password: string) {
  try {
    const authData = await pb.collection('users').authWithPassword(email, password);
    return authData.record;
  } catch (error) {
    console.error('Sign in error:', error);
    throw new Error('Authentication failed');
  }
}

export async function signOut() {
  pb.authStore.clear();
}

export function getCurrentUser() {
  return pb.authStore.model;
}

export async function isAuthenticated() {
  return pb.authStore.isValid;
}