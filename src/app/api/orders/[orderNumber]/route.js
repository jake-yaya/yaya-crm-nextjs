import axios from "axios";

export async function GET(request, { params }) {
  const { orderNumber } = await params;

  const url = process.env.DEPOSCO_SALES_ORDER_URL + orderNumber;
  const username = process.env.DEPOSCO_USERNAME;
  const password = process.env.DEPOSCO_PASSWORD;

  // Build and log the Authorization header
  const basicAuth = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
  console.log("Authorization Header:", basicAuth);

  try {
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        Authorization: basicAuth,
      },
    });
    const data = response.data;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API request failed:", error.response?.status, error.response?.statusText, error.response?.data);
    return new Response(JSON.stringify({ error: error.response?.data }), {
      status: error.response?.status,
    });
  }
}
