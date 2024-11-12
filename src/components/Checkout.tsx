import { useState } from 'react';
import { initiateSTKPush } from '../lib/mpesa';
import { pb } from '../lib/pocketbase';

export function Checkout({ total, products, onSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create order in PocketBase
      const order = await pb.collection('orders').create({
        user: pb.authStore.model.id,
        products,
        total,
        status: 'pending'
      });

      // Initiate M-Pesa payment
      const payment = await initiateSTKPush(phoneNumber, total);
      
      if (payment.ResponseCode === '0') {
        // Payment initiated successfully
        onSuccess();
      } else {
        setError('Payment initiation failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            M-Pesa Phone Number
          </label>
          <input
            type="tel"
            pattern="254[0-9]{9}"
            placeholder="254XXXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        
        <div className="mb-4">
          <p className="text-lg font-semibold">
            Total: KSH {total}
          </p>
        </div>

        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay with M-Pesa'}
        </button>
      </form>
    </div>
  );
}