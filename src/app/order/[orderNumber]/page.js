"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Order() {
  const params = useParams();
  const [orderData, setOrderData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline"); // timeline | notes | tasks

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return Number(value).toLocaleString(undefined, { style: "currency", currency: "USD" });
  };

  const formatPhone = (phone) => {
    if (!phone) return "—";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const fetchOrderData = async () => {
    setLoading(true);
    const response = await fetch("/api/orders/" + params.orderNumber);
    const data = await response.json();
    if (response.status === 200) setOrderData(data);
    else setError(data.error);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full px-4 py-2 text-left border-b ${activeTab === id ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
    >
      {label}
    </button>
  );

  function renderTabContent(orderData) {
    if (activeTab === "timeline") {
      const timeline = orderData?.timeline || {};
      console.log(timeline);
      const items = [
        { label: "Placed Date", value: timeline.placedDate },
        { label: "Deposco Downloaded", value: timeline.deposcoDownloaded },
        { label: "Planned Ship Date", value: timeline.plannedShipDate },
        { label: "Actual Ship Date", value: timeline.actualShipDate },
        { label: "Planned Arrival Date", value: timeline.plannedArrivalDate },
      ];

      return (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-sm font-medium text-gray-600">{item.label}</span>
              <span className="text-base text-gray-900">{item.value ? item.value : <span className="text-gray-400 italic">N/A</span>}</span>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "notes") {
      return <p className="text-gray-500">No notes available.</p>;
    }

    if (activeTab === "tasks") {
      return <p className="text-gray-500">No tasks available.</p>;
    }

    return null;
  }

  return (
    <main className="flex items-start justify-center min-h-screen bg-gray-50 pt-16">
      {/* The pt-16 matches navbar height */}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="max-w-7xl mx-auto p-6 flex gap-6">
          {/* Sidebar Tabs */}
          <aside className="w-72 bg-white rounded-lg shadow flex flex-col overflow-hidden h-[calc(100vh-3rem)]">
            <div className="border-b">
              <TabButton id="timeline" label="Timeline" />
              <TabButton id="notes" label="Notes" />
              <TabButton id="tasks" label="Tasks" />
            </div>
            <div className="flex-1 overflow-y-auto p-4">{renderTabContent(orderData.orderDetails)}</div>
          </aside>

          {/* Right Column: Order Details */}
          <div className="flex-1 grid grid-cols-6 gap-x-6 gap-y-5">
            {/* Customer Card */}
            <section className="col-span-3 bg-white rounded-lg shadow p-6 h-100">
              <h2 className="text-lg font-semibold mb-4">Customer</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Name</dt>
                  <dd className="mt-1 text-base font-medium text-gray-900">{orderData.customerDetails.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="mt-1 text-base font-medium text-gray-900">
                    {orderData.customerDetails.email ? (
                      <a className="text-blue-600 hover:underline" href={`mailto:${orderData.customerDetails.email}`}>
                        {orderData.customerDetails.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Phone</dt>
                  <dd className="mt-1 text-base font-medium text-gray-900">{formatPhone(orderData.orderDetails.shipTo.shipToPhoneNumber)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Address</dt>
                  <dd className="mt-1 text-base text-gray-900 space-y-1">
                    {orderData.orderDetails.shipTo.shipToLine1 && <div>{orderData.orderDetails.shipTo.shipToLine1}</div>}
                    {orderData.orderDetails.shipTo.shipToLine2 && <div>{orderData.orderDetails.shipTo.shipToLine2}</div>}
                    <div>
                      {orderData.orderDetails.shipTo.shipToCity && `${orderData.orderDetails.shipTo.shipToCity}, `}
                      {orderData.orderDetails.shipTo.shipToStateProvince} {orderData.orderDetails.shipTo.shipToPostalCode}
                    </div>
                    {orderData.orderDetails.shipTo.shipToCountry && <div>{orderData.orderDetails.shipTo.shipToCountry}</div>}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Order Summary Card */}
            <section className="col-span-3 bg-white rounded-lg shadow p-6 h-100">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="text-sm text-gray-500">Status: {orderData.orderDetails.status ?? "—"}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatCurrency(orderData.orderDetails.orderSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tax Total</span>
                    <span className="font-medium">{formatCurrency(orderData.orderDetails.orderTaxTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Shipping Paid</span>
                    <span className="font-medium">{formatCurrency(orderData.orderDetails.orderShipTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Discount</span>
                    <span className="font-medium">{formatCurrency(orderData.orderDetails.orderDiscountSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Order Total</span>
                    <span className="font-bold text-indigo-600">{formatCurrency(orderData.orderDetails.orderTotal)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Discount Code</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900">{orderData.orderDetails.discountCode ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Add Info</dt>
                    <dd className="mt-1 text-base text-gray-900">{orderData.orderDetails.holdReason ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Weight</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900">
                      {orderData.orderDetails.orderWeight
                        ? `${orderData.orderDetails.orderWeight} ${orderData.orderDetails.weightUnit ?? "lbs"}`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Ship Method</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900">{orderData.orderDetails.shipMethod ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Refund Total</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900">{formatCurrency(orderData.orderDetails.refundTotal)}</dd>
                  </div>
                </div>
              </div>
            </section>
            {/* Order Actions Card */}
            <section className="col-span-6 bg-white rounded-lg shadow p-6 h-40">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow">Issue Refund</button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow">Add Item</button>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow">Add Note</button>
                <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow">Call Back Request</button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow">Send Invoice</button>
              </div>
            </section>
            {/* Order Items Card */}
            <section className="col-span-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Image</th>
                    <th className="px-4 py-2 text-left">SKU</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Total Paid</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.lineItems.map((item, index) => (
                    <tr key={index} className="border-t">
                      {/* Image column */}
                      <td className="px-4 py-2">
                        <img src={item.itemImageURL} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      </td>
                      <td className="px-4 py-2">{item.productSKU}</td>
                      <td className="px-4 py-2">${item.unitPrice}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">${item.unitPrice * item.quantity}</td>
                      <td className="px-4 py-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
