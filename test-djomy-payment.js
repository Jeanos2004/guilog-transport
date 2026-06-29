const crypto = require('crypto');
const CLIENT_ID = 'djomy-client-1782743153077-aef6';
const CLIENT_SECRET = 's3cr3t-jhVYKKdtUjWyNfu-U7-EpwCSKuqWwjHu';
const signature = crypto.createHmac('sha256', CLIENT_SECRET).update(CLIENT_ID).digest('hex');
const apiKey = CLIENT_ID + ":" + signature;

async function testPayment() {
  const authRes = await fetch('https://sandbox-api.djomy.africa/v1/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
    body: JSON.stringify({})
  });
  const authData = await authRes.json();
  const token = authData.data.accessToken;

  const paymentRes = await fetch('https://sandbox-api.djomy.africa/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-API-KEY': apiKey
    },
    body: JSON.stringify({
      paymentMethod: 'OM',
      payerIdentifier: '00224622000000',
      amount: 50000,
      countryCode: 'GN',
      description: 'Test sandbox',
      merchantPaymentReference: 'TEST-' + Date.now(),
      returnUrl: 'https://cfig-guinee.com',
      cancelUrl: 'https://cfig-guinee.com'
    })
  });
  
  const paymentData = await paymentRes.json();
  console.log("PAYMENT RESPONSE:", paymentData);
}

testPayment().catch(console.error);
