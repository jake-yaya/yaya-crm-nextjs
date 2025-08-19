import { getProductImages } from "../../data/shopifyGraphQLRequestData";

function basicAuth(username, password) {
  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

function parseProductImages(data) {
  const productImagesMap = new Map();
  data.data.orders.edges[0].node.lineItems.edges.forEach(({ node }) => {
    const productId = node.product?.id ? Number(node.product.id.split("/").pop()) : null;
    if (productId) {
      productImagesMap.set(productId, node.product.featuredImage?.url ?? null);
    }
  });
  return productImagesMap;
}

export async function getShopifyOrderData(tradingPartnerData, orderNumber, importReference) {
  const shopifyOrderURL =
    tradingPartnerData.site_url + process.env.SHOPIFY_ORDER_BY_DEPOSCO_NUMBER_URL.replace("{orderNumber}", orderNumber);

  const shopifyEventsURL =
    tradingPartnerData.site_url + process.env.SHOPIFY_EVENTS_URL.replace("{shopifyOrderId}", importReference);

  const shopifyProductImagesURL = tradingPartnerData.site_url + process.env.SHOPIFY_GRAPHQL_URL;
  const [orderRes, eventsRes, productImagesRes] = await Promise.all([
    fetch(shopifyOrderURL, {
      headers: {
        Accept: "application/json",
        Authorization: basicAuth(tradingPartnerData.site_username, tradingPartnerData.site_password),
      },
      cache: "no-store",
    }),
    fetch(shopifyEventsURL, {
      headers: {
        Accept: "application/json",
        Authorization: basicAuth(tradingPartnerData.site_username, tradingPartnerData.site_password),
      },
      cache: "no-store",
    }),
    fetch(shopifyProductImagesURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": tradingPartnerData.site_password,
      },
      body: getProductImages(orderNumber),
      cache: "no-store",
    }),
  ]);
  return {
    order: (await orderRes.json()).orders?.[0] ?? null,
    events: (await eventsRes.json()).events ?? [],
    productImages: parseProductImages(await productImagesRes.json()) ?? [],
  };
}
