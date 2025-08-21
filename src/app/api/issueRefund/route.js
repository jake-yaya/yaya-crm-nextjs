import { NextResponse } from "next/server";
import { getSiteData } from "../../lib/database/order";
import {
  getShopifySiteCurrency,
  getShopifyOrderIdAndCustomerId,
  generateShopifyRefund,
  getTransactionsForRefund,
  createNoteOnShopifyOrder,
  shopifySiteUsesLoyaltyApp,
  createShopifyOrderGiftCard,
} from "../../lib/shopify/issueRefund";
import { createLoyaltyAppGiftCard } from "../../lib/loyaltyApp/issueRefund";

export async function POST(req) {
  try {
    const { orderNumber, orderSource, refundAmount, refundDescription, refundType } = await req.json();

    // 1. Get Shopify Site Data
    const siteData = await getSiteData(orderSource);

    // 2. Get Shopify Order ID
    const order = await getShopifyOrderIdAndCustomerId(siteData, orderNumber);
    if (!order) {
      return NextResponse.json({ error: `Order ${orderNumber} not found` }, { status: 404 });
    }
    const orderId = order.orderId;
    const customerId = order.customerId;

    // 3. Get site currency
    const siteCurrency = await getShopifySiteCurrency(siteData);

    // 4. Create Gift Card (if needed)
    const expirationDate = new Date();
    if (refundType == "Store Credit" && shopifySiteUsesLoyaltyApp(siteData.site_url))
      await createLoyaltyAppGiftCard(orderId, orderNumber, customerId, refundAmount, expirationDate, siteData.site_url);
    if (refundType == "Store Credit" && !shopifySiteUsesLoyaltyApp(siteData.site_url))
      await createShopifyOrderGiftCard(siteData, orderId, refundAmount, customerId, siteCurrency, orderNumber, expirationDate);

    // Set Refund Amount to zero because we don't want to refund customer after gift card has been credited
    let shopifyRefundAmount = refundType == "Store Credit" ? 0 : refundAmount;

    // 4. Get Shopify Order Transactions
    const transactions = await getTransactionsForRefund(siteData, orderId, shopifyRefundAmount);

    // 5. Create refund
    await generateShopifyRefund(siteData, orderId, orderNumber, siteCurrency, shopifyRefundAmount, transactions);

    // 6. Update order note
    await createNoteOnShopifyOrder(siteData, orderId, refundDescription);

    // TODO: hook in Deposco logic if needed (skipping here)

    return NextResponse.json({
      success: true,
      orderNumber,
      message: "Refund issued successfully",
    });
  } catch (err) {
    console.error("issueRefund error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
