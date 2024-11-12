import PocketBase from 'pocketbase';

// Initialize PocketBase with the provided URL from environment variables
export const pb = new PocketBase(import.meta.env.POCKETBASE_URL);

// Enable auto cancellation for requests
pb.autoCancellation(false);

// Ensure that the auth store is initialized
if (typeof window !== 'undefined' && pb.authStore.isValid) {
  // If there's a valid token stored in the session, save it to the auth store
  const token = window.localStorage.getItem('auth_token');
  if (token) {
    pb.authStore.save(token);
  }
}

// Set up auto-refresh for the auth token (if needed)
pb.authStore.onChange((auth) => {
  // Save the auth token to localStorage whenever it changes
  if (auth.isValid) {
    window.localStorage.setItem('auth_token', auth.token);
  } else {
    window.localStorage.removeItem('auth_token');
  }
});

