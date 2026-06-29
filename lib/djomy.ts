import crypto from 'crypto';

const CLIENT_ID = process.env.DJOMY_CLIENT_ID || "";
const CLIENT_SECRET = process.env.DJOMY_CLIENT_SECRET || "";
const PARTNER_DOMAIN = process.env.DJOMY_PARTNER_DOMAIN || "";
const API_URL = process.env.DJOMY_API_URL || "https://api.djomy.africa";

/**
 * Generate HMAC-SHA256 signature
 */
function generateSignature(): string {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn("Djomy credentials missing in env");
    return "";
  }
  return crypto.createHmac('sha256', CLIENT_SECRET).update(CLIENT_ID).digest('hex');
}

/**
 * Get the X-API-KEY header value
 */
function getApiKeyHeader(): string {
  return `${CLIENT_ID}:${generateSignature()}`;
}

/**
 * Authenticate to Djomy API and get Bearer token
 */
export async function getDjomyToken(): Promise<string> {
  const url = `${API_URL}/v1/auth`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': getApiKeyHeader(),
      'X-PARTNER-DOMAIN': PARTNER_DOMAIN
    },
    body: JSON.stringify({}),
    cache: 'no-store'
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Djomy Auth Error:", response.status, text);
    throw new Error(`Failed to authenticate with Djomy: ${response.status}`);
  }

  const data = await response.json();
  // Assume the response returns a token in data.token or data.access_token
  // Usually OAuth style endpoints return { access_token: "..." }
  return data.access_token || data.token || "";
}

/**
 * Initiate Direct Payment (without redirect) for Mobile Money
 */
export async function initiateDirectPayment(payload: {
  paymentMethod: "OM" | "MOMO" | "KULU",
  payerIdentifier: string,
  amount: number,
  description?: string,
  merchantPaymentReference: string,
  returnUrl?: string,
  cancelUrl?: string,
  metadata?: any
}) {
  const token = await getDjomyToken();
  const url = `${API_URL}/v1/payments`;

  const body = {
    paymentMethod: payload.paymentMethod,
    payerIdentifier: payload.payerIdentifier,
    amount: payload.amount,
    countryCode: "GN",
    description: payload.description || "Paiement de formation CFIG",
    merchantPaymentReference: payload.merchantPaymentReference,
    returnUrl: payload.returnUrl || "https://cfig-guinee.com/student/catalog",
    cancelUrl: payload.cancelUrl || "https://cfig-guinee.com/student/catalog",
    metadata: payload.metadata || {}
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-API-KEY': getApiKeyHeader(),
      'X-PARTNER-DOMAIN': PARTNER_DOMAIN
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Djomy Direct Payment Error:", response.status, text);
    throw new Error(`Failed to initiate direct payment: ${text}`);
  }

  return response.json();
}

/**
 * Initiate Gateway Payment (with redirect) for Cards
 */
export async function initiateGatewayPayment(payload: {
  amount: number,
  payerNumber: string,
  description?: string,
  merchantPaymentReference: string,
  returnUrl: string,
  cancelUrl: string,
  metadata?: any
}) {
  const token = await getDjomyToken();
  const url = `${API_URL}/v1/payments/gateway`;

  const body = {
    amount: payload.amount,
    countryCode: "GN",
    payerNumber: payload.payerNumber || "0022400000000",
    allowedPaymentMethods: ["CARD"],
    description: payload.description || "Paiement de formation CFIG",
    merchantPaymentReference: payload.merchantPaymentReference,
    returnUrl: payload.returnUrl,
    cancelUrl: payload.cancelUrl,
    metadata: payload.metadata || {}
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-API-KEY': getApiKeyHeader(),
      'X-PARTNER-DOMAIN': PARTNER_DOMAIN
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Djomy Gateway Payment Error:", response.status, text);
    throw new Error(`Failed to initiate gateway payment: ${text}`);
  }

  return response.json();
}

/**
 * Check Payment Status
 */
export async function checkPaymentStatus(transactionId: string) {
  const token = await getDjomyToken();
  const url = `${API_URL}/v1/payments/${transactionId}/status`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-API-KEY': getApiKeyHeader(),
      'X-PARTNER-DOMAIN': PARTNER_DOMAIN
    }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Djomy Status Error:", response.status, text);
    throw new Error(`Failed to get payment status: ${text}`);
  }

  return response.json();
}

/**
 * Verify Webhook Signature
 */
export function verifyWebhookSignature(signatureHeader: string, payloadStr: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('v1:')) return false;
  
  const extractedSignature = signatureHeader.split('v1:')[1];
  const computedSignature = crypto.createHmac('sha256', CLIENT_SECRET).update(payloadStr).digest('hex');
  
  // Timing safe equal is recommended for comparing hashes
  try {
    return crypto.timingSafeEqual(Buffer.from(extractedSignature), Buffer.from(computedSignature));
  } catch (e) {
    // Falls back if length differs
    return extractedSignature === computedSignature;
  }
}
