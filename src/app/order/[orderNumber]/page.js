"use client";
import { Menu, MenuButton } from "@headlessui/react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Field, Input, Label, Textarea } from "@headlessui/react";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

function formatDate(dateString) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} @ ${hours}:${minutes}`;
}

function formatDateWithoutTime(dateString) {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

//Types of Refunds Available when user presses Issue Refund button
const refundTypes = ["Store Credit", "Refund"];

export default function Order() {
  const params = useParams();
  const [orderData, setOrderData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline"); // timeline | notes | tasks
  const [isOpen, setIsOpen] = useState(false);
  const [selectRefundType, setSelectedRefundType] = useState(refundTypes[0]);
  const [actionType, setActionType] = useState("");
  const [copied, setCopied] = useState(false);

  const openModal = (type) => {
    setActionType(type);
    setIsOpen(true);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return Number(value).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
    });
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

  const handleOrderRefund = async (refundData) => {
    console.log(refundData);
    let orderRefundRes = await fetch("/api/issueRefund", {
      method: "POST",
      header: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(refundData),
    });
    return await orderRefundRes.json();
  };

  const handleOrderAction = async (orderAction, data) => {
    data.orderNumber = orderData.orderSummary.orderNumber;
    data.orderSource = orderData.orderSummary.orderSource;
    let orderActionRes;
    if (orderAction == "refund") {
      orderActionRes = await handleOrderRefund(data);
    }
    console.log(orderActionRes);
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

  const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // reset after 2s
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    };

    return (
      <div onClick={handleCopy} className="mr-5">
        {copied ? <ClipboardCheck className="w-5 h-5 text-green-600" /> : <Clipboard className="w-5 h-5 text-gray-500" />}
      </div>
    );
  };

  const OrderItems = ({ orderItems }) => {
    return (
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
        </table>
      </section>
    );
  };

  const CustomerDetails = ({ customer }) => {
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
                <div className="flex items-center">
                  <a className="text-blue-600 hover:underline mr-2" href={`mailto:${customer.email}`}>
                    {customer.email}
                  </a>
                  <CopyButton text={customer.email} />
                </div>
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
  };

  const OrderSummary = ({ orderSummary }) => {
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
  };

  const OrderOverview = ({ orderSummary }) => {
    return (
      <section className="col-span-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold mr-2">{orderSummary.orderNumber}</h2>
          <CopyButton text={orderSummary.orderNumber} />
          <p className="bg-green-500 text-white px-2 py-1 rounded-lg font-semibold mr-5">{orderSummary.orderStatus}</p>
          <p className="bg-blue-500 text-white px-2 py-1 rounded-lg font-semibold mr-5">{orderSummary.netsuiteOrderStatus}</p>
        </div>
        <div className="flex items-center pt-2">
          <h2 className="text-lg font-semibold">
            Promised Delivery Date: {formatDateWithoutTime(orderData.orderSummary.promisedDeliveryDate)}
          </h2>
        </div>
      </section>
    );
  };

  const ActionModal = ({ isOpen, onClose, actionType }) => {
    const renderFields = () => {
      switch (actionType) {
        case "refund":
          return (
            <>
              <Field className="mt-3">
                <Label className="text-sm/6 font-medium text-black">Amount</Label>
                <div className="relative mt-3">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">$</span>{" "}
                  <Input
                    name="refundAmount"
                    className={clsx(
                      "block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm/6 text-gray-900 placeholder-gray-400 shadow-sm",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      "pl-7"
                    )}
                  />
                </div>
              </Field>
              <Field className="mt-3">
                <Label className="text-sm/6 font-medium text-black mt-3">Description</Label>
                <div className="relative mt-3">
                  <Input
                    name="refundDescription"
                    className={clsx(
                      "block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm/6 text-gray-900 placeholder-gray-400 shadow-sm",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    )}
                  />
                </div>
              </Field>
              <Field className="mt-3">
                <Label className="text-sm/6 font-medium text-black mt-3">Refund Type</Label>
                <div className="relative mt-3">
                  <Listbox name="refundType" value={selectRefundType} onChange={setSelectedRefundType}>
                    <ListboxButton
                      className={clsx(
                        "block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm/6 text-gray-900 placeholder-gray-400 shadow-sm text-left",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      )}
                    >
                      {selectRefundType}
                      <ChevronDownIcon
                        className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-black/60"
                        aria-hidden="true"
                      />
                    </ListboxButton>
                    <ListboxOptions
                      anchor="bottom"
                      transition
                      className={clsx(
                        "w-(--button-width) rounded-lg border border-gray-300 bg-white py-1.5 [--anchor-gap:--spacing(1)] focus:outline-none",
                        "transition duration-100 ease-in data-leave:data-closed:opacity-0"
                      )}
                    >
                      {refundTypes.map((refundType) => (
                        <ListboxOption
                          key={refundType}
                          value={refundType}
                          className="group flex cursor-default gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
                        >
                          <CheckIcon className="invisible size-4 fill-black group-data-selected:visible" />
                          <div className="text-sm/6 text-black">{refundType}</div>
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </Listbox>
                </div>
              </Field>
            </>
          );
        case "addItem":
          return (
            <>
              <Field className="mt-3">
                <Label className="text-sm/6 font-medium text-black mt-3">Item Name</Label>
                <div className="relative mt-3">
                  <Input
                    name="addItemName"
                    className={clsx(
                      "block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm/6 text-gray-900 placeholder-gray-400 shadow-sm",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    )}
                  />{" "}
                </div>
              </Field>
              <Field className="mt-3">
                <Label className="text-sm/6 font-medium text-black mt-3">Quantity</Label>
                <div className="relative mt-3">
                  <Input
                    name="addItemQuantity"
                    type="number"
                    placeholder="1"
                    min={1}
                    className={clsx(
                      "block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm/6 text-gray-900 placeholder-gray-400 shadow-sm",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    )}
                  />
                </div>
              </Field>
            </>
          );
        case "addNote":
          return (
            <Field className="mt-3">
              <Label className="text-sm/6 font-medium text-black mt-3">Note</Label>
              <div className="relative mt-3">
                <Textarea
                  name="addNoteNote"
                  className={clsx(
                    "block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm/6 text-gray-900 placeholder-gray-400 shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  )}
                />
              </div>
            </Field>
          );
        case "callback":
          return (
            <Field className="mt-3">
              <Label className="text-sm/6 font-medium text-black mt-3">Callback Date</Label>
              <div className="relative mt-3">
                <Input
                  type="date"
                  name="callbackDate"
                  className={clsx(
                    "block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm/6 text-gray-900 placeholder-gray-400 shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  )}
                />
              </div>
            </Field>
          );
        case "invoice":
          return (
            <Field className="mt-3">
              <Label className="text-sm/6 font-medium text-black mt-3">Customer Email</Label>
              <div className="relative mt-3">
                <Input
                  type="email"
                  name="invoiceCustomerEmail"
                  placeholder="customer@example.com"
                  className={clsx(
                    "block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm/6 text-gray-900 placeholder-gray-400 shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  )}
                />
              </div>
            </Field>
          );
        default:
          return <p className="mt-3 text-sm text-gray-500">No form available.</p>;
      }
    };

    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <DialogTitle className="text-lg font-bold text-gray-900 capitalize">{actionType}</DialogTitle>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries()); // convert to object
                handleOrderAction(actionType, data);
                onClose();
              }}
            >
              {renderFields()}
              <div className="mt-7 flex justify-end gap-2">
                <button onClick={onClose} className="rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                  Confirm
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    );
  };

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
            <OrderOverview orderSummary={orderData.orderSummary} />
            <CustomerDetails customer={orderData.customer} />
            <OrderSummary orderSummary={orderData.orderSummary} />
            {/* Order Actions Card */}
            <section className="col-span-6 bg-white rounded-lg shadow p-6 h-40">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {/* Action Popup Modal */}
                <ActionModal isOpen={isOpen} onClose={() => setIsOpen(false)} actionType={actionType} />
                <Menu>
                  <MenuButton
                    onClick={() => openModal("refund")}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 mx-2 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 hover:bg-gray-700"
                  >
                    Issue Refund
                  </MenuButton>
                  <MenuButton
                    onClick={() => openModal("addItem")}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 mx-2 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700"
                  >
                    Add Item
                  </MenuButton>
                  <MenuButton
                    onClick={() => openModal("addNote")}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 mx-2 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700"
                  >
                    Add Note
                  </MenuButton>
                  <MenuButton
                    onClick={() => openModal("callback")}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 mx-2 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700"
                  >
                    Call Back Request
                  </MenuButton>
                  <MenuButton
                    onClick={() => openModal("invoice")}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 mx-2 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700"
                  >
                    Send Invoice
                  </MenuButton>
                </Menu>
              </div>
            </section>
            {/* Order Items Card */}
            <OrderItems orderItems={orderData.orderItems} />
          </div>
        </div>
      )}
    </main>
  );
}
