export async function createLoyaltyAppGiftCard(
  shopifyOrderId,
  shopifyOrderNumber,
  shopifyCustomerId,
  refundAmount,
  expirationDate,
  shopifySiteUrl
) {
  try {
    const shop = shopifySiteUrl.replace("https://", "");
    const query = new URLSearchParams({
      logged_in_customer_id: shopifyCustomerId,
      shop,
    }).toString();

    const endpoint = `${process.env.LOYALTY_APP_API_URL}/store/gc/create-code/rma?${query}`;

    // Convert to UTC, strip time to midnight, and return ISO8601 string with Z
    const formattedDate = new Date(
      Date.UTC(
        expirationDate.getUTCFullYear(),
        expirationDate.getUTCMonth(),
        expirationDate.getUTCDate(), // midnight UTC
        0,
        0,
        0,
        0
      )
    ).toISOString();

    const body = {
      orderGId: shopifyOrderId,
      value: Math.round(refundAmount * 100) / 100, // round to 2 decimals
      expiredDT: formattedDate,
      note: shopifyOrderNumber,
      suffix: "CRM",
    };

    console.log("Endpoint:", endpoint);
    console.log("Body:", body);

    // const response = await fetch(endpoint, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     ...loyaltyAppHeaders(), // implement this to return your headers
    //   },
    //   body: JSON.stringify(body),
    // });

    // if (!response.ok) {
    //   const errText = await response.text();
    //   throw new Error(`Request failed: ${response.status} ${errText}`);
    // }

    // return await response.json();
  } catch (error) {
    console.error("Error creating gift card:", error);
    throw error;
  }
}

/**
 * Example loyalty headers
 */
function loyaltyAppHeaders() {
  return {
    Authorization: `Bearer ${process.env.LOYALTY_APP_TOKEN}`,
    Accept: "application/json",
  };
}
