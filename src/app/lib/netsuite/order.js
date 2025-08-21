import OAuth from "oauth-1.0a";
import crypto from "crypto";

function createOAuth() {
  return new OAuth({
    consumer: { key: process.env.NETSUITE_CONSUMER_KEY, secret: process.env.NETSUITE_CONSUMER_SECRET },
    signature_method: "HMAC-SHA256",
    hash_function(base_string, key) {
      return crypto.createHmac("sha256", key).update(base_string).digest("base64");
    },
  });
}

export async function getNetsuiteOrderId(orderNumber) {
  const url = process.env.NETSUITE_QUERY_URL.replace("{accountId}", process.env.NETSUITE_ACCOUNT_ID);

  const oauth = createOAuth();
  const request_data = { url, method: "POST" };

  const authHeader = oauth.toHeader(
    oauth.authorize(request_data, { key: process.env.NETSUITE_TOKEN_ID, secret: process.env.NETSUITE_TOKEN_SECRET })
  );
  const headers = {
    Authorization: authHeader.Authorization + `, realm="${process.env.NETSUITE_ACCOUNT_ID}"`,
    "Content-Type": "application/json",
    Accept: "application/json",
    Prefer: "transient",
  };

  const body = JSON.stringify({
    q: `SELECT id FROM transaction WHERE type = 'SalesOrd' AND otherrefnum = '${orderNumber}'`,
  });

  const res = await fetch(url, { method: "POST", headers, body });
  console.log(res);
  const data = await res.json();
  return res.status === 200 ? data.items[0].id : null;
}

export async function getNetsuiteOrder(orderId) {
  const url = process.env.NETSUITE_SALES_ORDER_URL.replace("{accountId}", process.env.NETSUITE_ACCOUNT_ID).replace(
    "{orderId}",
    orderId
  );

  const oauth = createOAuth();
  const request_data = { url, method: "GET" };

  const authHeader = oauth.toHeader(
    oauth.authorize(request_data, { key: process.env.NETSUITE_TOKEN_ID, secret: process.env.NETSUITE_TOKEN_SECRET })
  );

  const headers = {
    Authorization: authHeader.Authorization + `, realm="${process.env.NETSUITE_ACCOUNT_ID}"`,
    "Content-Type": "application/json",
    Accept: "application/json",
    Prefer: "transient",
  };
  const res = await fetch(url, { method: "GET", headers });
  return await res.json();
}
