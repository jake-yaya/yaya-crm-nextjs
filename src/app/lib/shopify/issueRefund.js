function basicAuth(username, password) {
  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

export async function getShopifySiteCurrency(siteData) {
  const shopifySiteCurrencyURL = siteData.site_url + process.env.SHOPIFY_SHOP_URL;

  var siteCurrencyRes = await fetch(shopifySiteCurrencyURL, {
    headers: {
      Accept: "application/json",
      Authorization: basicAuth(siteData.site_username, siteData.site_password),
    },
    cache: "no-store",
  });

  return (await siteCurrencyRes.json()).shop?.currency ?? null;
}

export async function getShopifyOrderIdAndCustomerId(siteData, orderNumber) {
  const shopifyOrderURL =
    siteData.site_url + process.env.SHOPIFY_ORDER_BY_DEPOSCO_NUMBER_URL.replace("{orderNumber}", orderNumber);

  var orderRes = await fetch(shopifyOrderURL, {
    headers: {
      Accept: "application/json",
      Authorization: basicAuth(siteData.site_username, siteData.site_password),
    },
    cache: "no-store",
  });
  const order = (await orderRes.json()).orders?.[0];
  if (order)
    return {
      orderId: order.id,
      customerId: order.customer.id,
    };
}

export async function generateShopifyRefund(siteData, orderId, orderNumber, siteCurrency, amount, transactions) {
  const shopifyRefundURL = siteData.site_url + process.env.SHOPIFY_REFUND_URL.replace("{orderId}", orderId);

  const refundReqBody = {
    refund: {
      currency: siteCurrency,
      notify: amount > 0,
      shipping: { full_refund: false },
      note: orderNumber,
      transactions: transactions,
    },
  };

  // var orderRes = await fetch(shopifyRefundURL, {
  //   method: "POST",
  //   headers: {
  //     Accept: "application/json",
  //     Authorization: basicAuth(siteData.site_username, siteData.site_password),
  //   },
  //   body: refundReqBody,
  // });

  // return (await orderRes.json()).orders?.[0]?.id ?? null;
}

export async function getTransactionsForRefund(siteData, orderId, amount) {
  const shopifyOrderTransactionsURL =
    siteData.site_url + process.env.SHOPIFY_ORDER_TRANSACTIONS_URL.replace("{orderId}", orderId);

  const response = await fetch(shopifyOrderTransactionsURL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: basicAuth(siteData.site_username, siteData.site_password),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }

  const data = await response.json();
  let orderTransactions = data.transactions;

  // Subtract refunded amounts from parent transactions
  for (let transaction of orderTransactions) {
    if (transaction.kind !== "refund" || transaction.status !== "success" || !transaction.parent_id) continue;

    for (let i = 0; i < orderTransactions.length; i++) {
      if (orderTransactions[i].id !== transaction.parent_id) continue;
      orderTransactions[i].amount = orderTransactions[i].amount - transaction.amount;
    }
  }

  // Case: amount = 0 (return full refund transaction for success transaction)
  if (amount === 0) {
    for (let transaction of orderTransactions) {
      if (transaction.status === "success") {
        return [
          {
            kind: "refund",
            gateway: transaction.gateway,
            parent_id: transaction.id,
            amount: 0,
          },
        ];
      }
    }
    return [];
  }

  let transactions = [];
  let price = amount;

  // Refund gift cards first
  for (let transaction of orderTransactions) {
    if (transaction.gateway === "gift_card" && transaction.status === "success" && transaction.amount > 0) {
      let transactionAmount = Math.min(transaction.amount, price);
      transactions.push({
        kind: "refund",
        gateway: transaction.gateway,
        parent_id: transaction.id,
        amount: transactionAmount,
      });
      price -= transactionAmount;
      if (price === 0) return transactions;
    }
  }

  // Refund other gateways
  for (let transaction of orderTransactions) {
    if (transaction.gateway !== "gift_card" && transaction.kind !== "refund" && transaction.status === "success") {
      let transactionAmount = Math.min(transaction.amount, price);
      transactions.push({
        kind: "refund",
        gateway: transaction.gateway,
        parent_id: transaction.id,
        amount: transactionAmount,
      });
      price -= transactionAmount;
      if (price === 0) return transactions;
    }
  }

  return [];
}

export async function createNoteOnShopifyOrder(siteData, orderId, noteText) {
  const shopifyOrderNoteURL = siteData.site_url + process.env.SHOPIFY_ORDER_NOTE_URL.replace("{orderId}", orderId);

  // const orderNoteRes = await fetch(shopifyOrderNoteURL, {
  //   method: "PUT",
  //   headers: {
  //     Accept: "application/json",
  //     Authorization: basicAuth(siteData.site_username, siteData.site_password),
  //   },
  //   body: {
  //     order: { note: noteText },
  //   },
  // });

  // return (await orderNoteRes.json()) ?? null;
}

export async function shopifySiteUsesLoyaltyApp(siteURL) {
  return [
    "https://efavormart-new.myshopify.com",
    "https://tableclothsfactory-com.myshopify.com",
    "https://efavormart-home-decor.myshopify.com",
    "https://silkflowersfactory.myshopify.com",
    "https://ya-ya-wholesale.myshopify.com",
  ].includes(siteURL);
}

export async function createShopifyOrderGiftCard(
  siteData,
  orderId,
  refundAmount,
  customerId,
  currency,
  orderNumber,
  expirationDate
) {
  const shopifyGiftCardURL = siteData.site_url + process.env.SHOPIFY_GIFT_CARD_URL;

  // const giftCardRes = await fetch(shopifyGiftCardURL, {
  //   method: "PUT",
  //   headers: {
  //     Accept: "application/json",
  //     Authorization: basicAuth(siteData.site_username, siteData.site_password),
  //   },
  //   body: {
  //     gift_card: {
  //       initial_value: refundAmount,
  //       order_id: orderId,
  //       customer_id: customerId,
  //       currency: currency,
  //       note: orderNumber,
  //       expires_on: expirationDate.toISOString().split("T")[0],
  //     },
  //   },
  // });

  // return (await giftCardRes.json()) ?? null;
}
