"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function Order() {
  const params = useParams();
  const [orderData, setOrderData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline"); // timeline | notes | tasks

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return Number(value).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
    });
  };

  const calculateOrderWeight = (order) => {
    if (order === null || order === undefined || order === "") return "—";
    let orderWeight = 0;
    console.log(order);
    order.orderLines.orderLine.forEach((ol) => {
      orderWeight += Number(ol.orderPackQuantity) * Number(ol.pack.weight);
    });
    return orderWeight;
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
    console.log(data);
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

  function renderTabContent(timeline, notes) {
    if (activeTab === "timeline") {
      const items = [
        { label: "Placed Date", value: timeline.placedDate },
        { label: "Deposco Downloaded", value: timeline.deposcoDownloaded },
        { label: "Planned Ship Date", value: timeline.plannedShipDate },
        { label: "Actual Ship Date", value: timeline.actualShipDate },
        { label: "Planned Arrival Date", value: timeline.plannedArrivalDate },
      ];

      return (
        <div className="space-y-4">
          {timeline.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-sm font-medium text-gray-600">{item.label}</span>
              <span className="text-base text-gray-900">
                {item.date ? formatDate(item.date) : <span className="text-gray-400 italic">N/A</span>}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "notes") {
      if (!notes || notes.length === 0) {
        return <p className="text-gray-500">No notes available.</p>;
      }

      return (
        <ul className="space-y-4">
          {[...notes].map((event) => (
            <li key={event.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-800">{event.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                <span>{event.author}</span> •{" "}
                <span>
                  {new Date(event.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      );
    }

    if (activeTab === "tasks") {
      return <p className="text-gray-500">No tasks available.</p>;
    }

    return null;
  }

  function renderOrderItems(orderItems) {
    return (
      <tbody>
        {orderItems.map((lineItem, index) => (
          <tr key={index} className="border-t">
            {/* Image column */}
            <td className="px-4 py-2">
              <img src={lineItem.image} alt={lineItem.sku} className="w-16 h-16 object-cover rounded" />
            </td>
            <td className="px-4 py-2">{lineItem.sku}</td>
            <td className="px-4 py-2">${lineItem.price}</td>
            <td className="px-4 py-2">{lineItem.quantity}</td>
            <td className="px-4 py-2">${lineItem.total_paid}</td>
            <td className="px-4 py-2">{lineItem.status}</td>
          </tr>
        ))}
      </tbody>
    );
  }

  function renderCustomerDetails(customer) {
    return (
      <section className="col-span-3 bg-white rounded-lg shadow p-6 h-100">
        <h2 className="text-lg font-semibold mb-4">Customer</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500">Name</dt>
            <dd className="mt-1 text-base font-medium text-gray-900">{customer.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="mt-1 text-base font-medium text-gray-900">
              {customer.email ? (
                <a className="text-blue-600 hover:underline" href={`mailto:${customer.email}`}>
                  {customer.email}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Phone</dt>
            <dd className="mt-1 text-base font-medium text-gray-900">{formatPhone(customer.phone)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Address</dt>
            <dd className="mt-1 text-base text-gray-900 space-y-1">
              {customer.address.addressLine1 && <div>{customer.address.addressLine1}</div>}
              {customer.address.addressLine2 && <div>{customer.address.addressLine2}</div>}
              <div>
                {customer.address.city && `${customer.address.city}, `}
                {customer.address.stateProvinceCode} {customer.address.postalCode}
              </div>
              {customer.address.countryCode && <div>{customer.address.countryCode}</div>}
            </dd>
          </div>
        </dl>
      </section>
    );
  }

  function renderOrderSummary(orderSummary) {
    return (
      <section className="col-span-3 bg-white rounded-lg shadow p-6 h-100">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(orderSummary.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tax Total</span>
              <span className="font-medium">{formatCurrency(orderSummary.taxTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Shipping Paid</span>
              <span className="font-medium">{formatCurrency(orderSummary.shippingPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Discount</span>
              <span className="font-medium">-{formatCurrency(orderSummary.discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Order Total</span>
              <span className="font-bold text-indigo-600">{formatCurrency(orderSummary.orderTotal)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Discount Code</dt>
              <dd className="mt-1 text-base font-medium text-gray-900">{orderSummary.discountCode}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Add Info</dt>
              <dd className="mt-1 text-base text-gray-900 max-w-full overflow-x-auto whitespace-nowrap">
                {orderSummary.addInfo}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Weight</dt>
              <dd className="mt-1 text-base font-medium text-gray-900">{orderSummary.weight}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Ship Method</dt>
              <dd className="mt-1 text-base font-medium text-gray-900">{orderSummary.shipMethod}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Refund Total</dt>
              <dd className="mt-1 text-base font-medium text-gray-900">{formatCurrency(orderSummary.refundTotal)}</dd>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderOrderOverview(orderSummary) {
    return (
      <section className="col-span-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold mr-5">{orderSummary.orderNumber}</h2>
          <p className="bg-green-500 text-white px-2 py-1 rounded-lg font-semibold mr-5">{orderSummary.orderStatus}</p>
          <p className="bg-blue-500 text-white px-2 py-1 rounded-lg font-semibold mr-5">{orderSummary.netsuiteOrderStatus}</p>
        </div>
      </section>
    );
  }

  return (
    <main className="flex items-start justify-center min-h-screen bg-gray-50 pt-16">
      {/* The pt-16 matches navbar height */}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-gray-600">{error}</p>
      ) : (
        <div className="max-w-7xl mx-auto p-6 flex gap-6">
          {/* Sidebar Tabs */}
          <aside className="w-72 bg-white rounded-lg shadow flex flex-col overflow-hidden h-[calc(100vh-3rem)]">
            <div className="border-b">
              <TabButton id="timeline" label="Timeline" />
              <TabButton id="notes" label="Notes" />
              <TabButton id="tasks" label="Tasks" />
            </div>
            <div className="flex-1 overflow-y-auto p-4">{renderTabContent(orderData.timeline, orderData.notes)}</div>
          </aside>

          {/* Right Column: Order Details */}
          <div className="flex-1 grid grid-cols-6 gap-x-6 gap-y-5">
            {/* Order Overview Card */}
            {renderOrderOverview(orderData.orderSummary)}
            {/* Customer Card */}
            {renderCustomerDetails(orderData.customer)}

            {/* Order Summary Card */}
            {renderOrderSummary(orderData.orderSummary)}
            {/* Order Actions Card */}
            <section className="col-span-6 bg-white rounded-lg shadow p-6 h-40">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Menu as="div" className="relative inline-block">
                  <MenuButton className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 mx-2 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700">
                    Issue Refund
                    <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
                  </MenuButton>

                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    <div className="py-1">
                      <MenuItem>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                          Store Credit
                        </a>
                      </MenuItem>
                      <MenuItem>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                          Refund
                        </a>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
                <Menu>
                  <MenuButton className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 mx-2 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700">
                    Add Item
                  </MenuButton>
                  <MenuButton className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 mx-2 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700">
                    Add Note
                  </MenuButton>
                  <MenuButton className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 mx-2 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700">
                    Call Back Request
                  </MenuButton>
                  <MenuButton className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 mx-2 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700">
                    Send Invoice
                  </MenuButton>
                </Menu>
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
                {renderOrderItems(orderData.orderItems)}
              </table>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
