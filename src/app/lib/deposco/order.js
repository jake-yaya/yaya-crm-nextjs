function basicAuth(username, password) {
  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

export async function getDeposcoOrderAndChildOrders(orderNumber) {
  const [orderRes, childOrdersRes] = await Promise.all([
    fetch(process.env.DEPOSCO_BASE_URL + process.env.DEPOSCO_SALES_ORDER_URL + orderNumber, {
      headers: {
        Accept: "application/json",
        Authorization: basicAuth(process.env.DEPOSCO_USERNAME, process.env.DEPOSCO_PASSWORD),
      },
      next: { revalidate: 300 },
    }),
    fetch(process.env.DEPOSCO_BASE_URL + process.env.DEPOSCO_CHILD_SALES_ORDERS_URL + orderNumber, {
      headers: {
        Accept: "application/json",
        Authorization: basicAuth(process.env.DEPOSCO_USERNAME, process.env.DEPOSCO_PASSWORD),
      },
      next: { revalidate: 300 },
    }),
  ]);

  return {
    deposcoOrder: (await orderRes.json()).order?.[0] ?? null,
    deposcoChildOrders: (await childOrdersRes.json()).order ?? [],
  };
}
