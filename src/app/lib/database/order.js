function basicAuth(username, password) {
  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

export async function getSiteData(orderSource) {
  const res = await fetch(process.env.TRADING_PARTNER_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: basicAuth(process.env.DEPOSCO_USERNAME, process.env.DEPOSCO_PASSWORD),
      "Content-Type": "text/plain",
    },
    body: `select * from site_reference where description = '${orderSource}'`,
    next: { revalidate: 3600 },
  });
  const data = await res.json();
  return data?.[0] ?? null;
}
