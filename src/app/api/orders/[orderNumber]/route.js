import { getDeposcoOrderAndChildOrders, getTradingPartner } from "../../../lib/deposco";
import { getNetsuiteOrderId, getNetsuiteOrder } from "../../../lib/netsuite";
import { getShopifyOrderData } from "../../../lib/shopify";

function formOrderItemsObject(deposcoOrder, shopifyOrder, productImages) {
  const orderItems = [];
  let productImagesMap = new Map();
  if (shopifyOrder) {
    shopifyOrder.line_items.forEach((lineItem) => {
      productImagesMap.set(lineItem.id, productImages.get(lineItem.product_id));
    });
  } else {
    deposcoOrder.orderLines.orderLine.forEach((ol) => {});
  }

  deposcoOrder.orderLines.orderLine.forEach((ol) => {
    orderItems.push({
      image: productImagesMap.get(Number(ol.customerLineNumber)) ?? productImagesMap.get(ol.itemNumber),
      sku: ol.itemNumber,
      price: Number(ol.unitPrice).toFixed(2),
      quantity: Number(ol.orderPackQuantity).toFixed(0),
      total_paid: (ol.orderPackQuantity * ol.unitPrice).toFixed(2),
      status: ol.lineStatus,
    });
  });
  return orderItems;
}

function formOrderTimelineObject(deposcoOrder, deposcoChildOrders, netsuiteOrder) {
  const timeline = [];
  timeline.push({
    date: deposcoOrder.placedDate,
    label: deposcoOrder.number + " Placed",
    source: "deposco",
    description: deposcoOrder.orderNumber + " placed at " + deposcoOrder.placedDate,
  });
  timeline.push({
    date: deposcoOrder.createdDateTime,
    label: deposcoOrder.number + " Downloaded",
    source: "deposco",
    description: deposcoOrder.orderNumber + " downloaded to Deposco at" + deposcoOrder.createdDateTime,
  });
  timeline.push({
    date: deposcoOrder.plannedArrivalDate,
    label: deposcoOrder.number + " Planned Arrival Date",
    source: "deposco",
    description: deposcoOrder.orderNumber + " has a planned arrival date of " + deposcoOrder.plannedArrivalDate,
  });
  deposcoChildOrders.forEach((childOrder) => {
    timeline.push({
      date: childOrder.createdDateTime,
      label: childOrder.number + " Downloaded",
      source: "deposco",
      description: childOrder.number + " downloaded to Deposco at" + childOrder.createdDateTime,
    });
  });
  if (netsuiteOrder) {
    timeline.push({
      date: netsuiteOrder.createdDate,
      label: "Netsuite Created",
      source: "netsuite",
    });
  }
  timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  return timeline;
}

function formOrderCustomerObject(deposcoOrder) {
  const customer = {
    name: deposcoOrder.shipToAddress.name,
    email: deposcoOrder.shipToAddress.email,
    phone: deposcoOrder.shipToAddress.phone,
    address: {
      addressLine1: deposcoOrder.shipToAddress.addressLine1,
      addressLine2: deposcoOrder.shipToAddress.addressLine2,
      stateProvinceCode: deposcoOrder.shipToAddress.stateProvinceCode,
      postalCode: deposcoOrder.shipToAddress.postalCode,
      countryCode: deposcoOrder.shipToAddress.countryCode,
    },
  };
  return customer;
}

function formOrderNotesObject(shopifyEvents) {
  const notes = [];
  shopifyEvents.forEach(({ id, description, author, created_at }) => {
    notes.push({
      id,
      description,
      author,
      created_at,
    });
  });
  return notes.reverse();
}

function formOrderSummaryObject(deposcoOrder, shopifyOrder, netsuiteOrder) {
  const orderSummary = {
    orderNumber: deposcoOrder.number,
    orderStatus:
      (shopifyOrder.fulfillment_status === "partial" ? "Partially Shipped" : shopifyOrder.fulfillment_status) || deposcoOrder.currentStatus,
    netsuiteOrderStatus: netsuiteOrder.orderStatus.refName,
    subtotal: deposcoOrder.orderSubTotal,
    taxTotal: deposcoOrder.orderTaxTotal,
    shippingPaid: deposcoOrder.orderShipTotal,
    orderTotal: deposcoOrder.orderTotal,
    discount: shopifyOrder ? shopifyOrder.total_discounts : "0.00",
    discountCode: shopifyOrder && shopifyOrder.discount_codes.length > 0 ? shopifyOrder.discount_codes[0].code : "",
    addInfo: deposcoOrder.customAttribute7,
    weight: deposcoOrder.orderLines.orderLine.reduce((accumulator, ol) => accumulator + Number(ol.pack.weight) * Number(ol.orderPackQuantity), 0),
    shipMethod: deposcoOrder.customAttribute4,
    refundTotal: 0, //needs implementing
  };
  return orderSummary;
}

export async function GET(request, { params }) {
  const { orderNumber } = await params;

  try {
    // 1️⃣ Deposco
    const { deposcoOrder, deposcoChildOrders } = await getDeposcoOrderAndChildOrders(orderNumber);
    if (!deposcoOrder) {
      return new Response(JSON.stringify({ error: "Order not found in Deposco" }), { status: 404 });
    }

    // 2️⃣ Trading Partner
    const tradingPartnerData = await getTradingPartner(deposcoOrder.orderSource);

    // 3️⃣ Netsuite
    const netsuiteOrderId = await getNetsuiteOrderId(orderNumber);
    const netsuiteOrder = netsuiteOrderId ? await getNetsuiteOrder(netsuiteOrderId) : null;

    // 4️⃣ Shopify (only if partner is Shopify)
    let shopifyOrder = null;
    let shopifyEvents = [];
    let shopifyProductImages = [];
    if (tradingPartnerData?.site_type === "Shopify") {
      const shopifyData = await getShopifyOrderData(tradingPartnerData, orderNumber, deposcoOrder.importReference);
      shopifyOrder = shopifyData.order;
      shopifyEvents = shopifyData.events;
      shopifyProductImages = shopifyData.productImages;
    }

    // ✅ Return combined response
    return new Response(
      JSON.stringify({
        orderSummary: formOrderSummaryObject(deposcoOrder, shopifyOrder, netsuiteOrder),
        timeline: formOrderTimelineObject(deposcoOrder, deposcoChildOrders, netsuiteOrder),
        notes: formOrderNotesObject(shopifyEvents),
        orderItems: formOrderItemsObject(deposcoOrder, shopifyOrder, shopifyProductImages),
        customer: formOrderCustomerObject(deposcoOrder),
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("API Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), { status: 500 });
  }
}
