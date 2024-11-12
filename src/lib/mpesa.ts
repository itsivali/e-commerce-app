const MPESA_CONSUMER_KEY = import.meta.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = import.meta.env.MPESA_CONSUMER_SECRET;
const MPESA_PASSKEY = import.meta.env.MPESA_PASSKEY;
const MPESA_SHORTCODE = import.meta.env.MPESA_SHORTCODE;

export async function initiateSTKPush(phoneNumber: string, amount: number) {
  try {
    const auth = await getOAuthToken();
    const timestamp = getCurrentTimestamp();
    const password = generatePassword(timestamp);

    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${import.meta.env.PUBLIC_SITE_URL}/api/mpesa/callback`,
        AccountReference: "ClothesStore",
        TransactionDesc: "Payment for clothes"
      })
    });

    return await response.json();
  } catch (error) {
    console.error('STK Push failed:', error);
    throw new Error('Payment initiation failed');
  }
}

async function getOAuthToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  
  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  const { access_token } = await response.json();
  return access_token;
}

function getCurrentTimestamp() {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
}

function generatePassword(timestamp: string) {
  return Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
}