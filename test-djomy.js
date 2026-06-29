const crypto = require('crypto');
const CLIENT_ID = 'djomy-client-1782743153077-aef6';
const CLIENT_SECRET = 's3cr3t-jhVYKKdtUjWyNfu-U7-EpwCSKuqWwjHu';

const signature = crypto.createHmac('sha256', CLIENT_SECRET).update(CLIENT_ID).digest('hex');
const apiKey = CLIENT_ID + ":" + signature;

fetch('https://sandbox-api.djomy.africa/v1/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': apiKey
  },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(data => {
  console.log("RESPONSE:", data);
})
.catch(console.error);
