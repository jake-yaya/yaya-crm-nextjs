import axios from "axios";

// Use a single function to encode Basic Auth
function basicAuth(username, password) {
  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

const deposcoAuth = basicAuth(process.env.DEPOSCO_USERNAME, process.env.DEPOSCO_PASSWORD);

// Axios instance for Deposco so we don't keep repeating headers
const deposcoClient = axios.create({
  baseURL: process.env.DEPOSCO_BASE_URL, // optional if you have one
  headers: {
    Accept: "application/json",
    Authorization: deposcoAuth,
  },
});

// --- API Helpers ---
async function getOrderDataFromDeposco(orderNumber) {
  const { data } = await deposcoClient.get(process.env.DEPOSCO_SALES_ORDER_URL + orderNumber);
  return data.order?.[0] ?? null;
}

async function getTradingPartnerFromDeposco(tradingPartnerName) {
  const query = `select * from site_reference where description = '${tradingPartnerName}'`;

  const { data } = await deposcoClient.post(process.env.TRADING_PARTNER_URL, query, {
    headers: { "Content-Type": "text/plain" },
  });

  return data?.[0] ?? null;
}

export async function GET(request, { params }) {
  const { orderNumber } = await params;

  try {
    // 1️⃣ Get Deposco Order + Trading Partner Data
    const deposcoOrderData = await getOrderDataFromDeposco(orderNumber);

    if (!deposcoOrderData) {
      return new Response(JSON.stringify({ error: "Order not found in Deposco" }), { status: 404 });
    }

    const tradingPartnerData = await getTradingPartnerFromDeposco(deposcoOrderData.orderSource);
    if (!tradingPartnerData) {
      return new Response(JSON.stringify({ error: "Trading partner not found" }), { status: 404 });
    }

    // 2️⃣ Build URLs
    const deposcoURL = process.env.DEPOSCO_LOOKUP_ORDER_URL.replace("{orderNumber}", orderNumber);
    const shopifyEventsURL = `${tradingPartnerData.site_url}/admin/api/2025-01/orders/${deposcoOrderData.importReference}/events.json`;

    // 3️⃣ Make requests in parallel
    const [deposcoResponse, shopifyEventsResponse] = await Promise.all([
      deposcoClient.get(deposcoURL),
      axios.get(shopifyEventsURL, {
        headers: {
          Accept: "application/json",
          Authorization: basicAuth(tradingPartnerData.site_username, tradingPartnerData.site_password),
        },
      }),
    ]);

    return new Response(
      JSON.stringify({
        deposco: deposcoResponse.data,
        events: shopifyEventsResponse.data,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("API request failed:", error.response?.status, error.message);

    return new Response(
      JSON.stringify({
        error: error.response?.data || error.message || "Unknown error",
      }),
      { status: error.response?.status || 500 }
    );
  }
}
