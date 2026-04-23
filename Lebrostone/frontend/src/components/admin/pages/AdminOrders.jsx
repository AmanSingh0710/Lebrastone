import React, { useState, useEffect } from "react";
import instance from "../../web/api/AxiosConfig";
import { useToast } from "../../../context/ToastContext";
import {
  Package,
  Search,
  Eye,
  Trash2,
  Loader2,
  MapPin,
  CheckCircle,
  Clock,
  Truck,
  X,
  User,
  Receipt,
  Phone, // Added Phone icon
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const AdminOrders = () => {
  const { success, error } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- NEW STATES FOR WHATSAPP ---
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("");

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const res = await instance.get("/api/orders/all");
      setOrders(res.data.success ? res.data.data : []);
    } catch (err) {
      error(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // --- WHATSAPP LOGIC ---
  const openWhatsappEditor = (order) => {
    const productDetails = order.products
      .map((p) => `- ${p.name} (Qty: ${p.quantity})`)
      .join("\n");
    const customerName = order.user?.name || order.guestName || "Customer";
    const message = `Hello ${customerName},\n\nRegarding your Order #${order._id.slice(-8).toUpperCase()}:\n${productDetails}\n\nTotal Amount: ₹${order.finalTotal}\nStatus: ${order.deliveryStatus}\n\nThank you!`;

    setWhatsappMessage(message);
    setIsWhatsappModalOpen(true);
  };

  const sendWhatsapp = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const phoneNumber =
      selectedOrder.user?.phoneNumber || selectedOrder.guestPhone;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      "_blank",
    );
    setIsWhatsappModalOpen(false);
  };

  const togglePaymentStatus = async (orderId, currentStatus) => {
    const newStatus = currentStatus === "Pending" ? "Received" : "Pending";
    if (window.confirm(`Change payment status to "${newStatus}"?`)) {
      try {
        const res = await instance.put(
          `/api/payments/update-payment/${orderId}`,
          { status: newStatus },
        );
        if (res.data.success) {
          success("Payment status updated successfully!");
          fetchAllOrders();
        }
      } catch (err) {
        error(err.message || "Payment update failed");
      }
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await instance.put(`/api/orders/update-status/${orderId}`, {
        status: newStatus,
      });
      if (res.data.success) {
        success("Order status updated successfully!");
        fetchAllOrders();
      }
    } catch (err) {
      error(err.message || "Failed to update order status");
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm("Delete order record?")) {
      try {
        await instance.delete(`/api/orders/delete/${id}`);
        success("Order deleted successfully");
        fetchAllOrders();
      } catch (err) {
        error(err.message || "Failed to delete order");
      }
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.city
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 text-black">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              <Package className="text-blue-600" /> Order Management
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Track shipments and payments
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-widest font-bold">
                  <th className="p-5">Order Info</th>
                  <th className="p-5">Items</th>
                  <th className="p-5">Payment & Amount</th>
                  <th className="p-5">Delivery Status</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-5">
                      <p className="font-bold text-blue-600 text-xs mb-1">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-slate-500 text-[11px]">
                        <MapPin size={12} /> {order.shippingAddress?.city}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex -space-x-3">
                        {order.products.slice(0, 3).map((p, i) => (
                          <img
                            key={i}
                            src={p.image}
                            className="h-8 w-8 rounded-full ring-2 ring-white bg-white border object-contain"
                            alt="p"
                          />
                        ))}
                      </div>
                      <p className="text-[10px] mt-1 font-bold text-slate-400">
                        {order.products.length} Items
                      </p>
                    </td>
                    <td className="p-5">
                      <p className="font-black text-slate-900 text-sm">
                        ₹{order.finalTotal}
                      </p>
                      <button
                        onClick={() =>
                          togglePaymentStatus(order._id, order.paymentStatus)
                        }
                        className={`mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded border transition-all ${
                          order.paymentStatus === "Received"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {order.paymentStatus}
                      </button>
                    </td>
                    <td className="p-5">
                      <select
                        value={order.deliveryStatus}
                        onChange={(e) =>
                          updateStatus(order._id, e.target.value)
                        }
                        className="text-[10px] font-black uppercase py-1.5 px-3 rounded-full border-none shadow-sm outline-none cursor-pointer bg-slate-100"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-slate-400 hover:text-blue-600"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="p-2 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- VIEW DETAILS MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Receipt className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Order Details
                  </h2>
                  <p className="text-xs text-slate-500 font-bold uppercase">
                    ID: #{selectedOrder._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={14} /> Shipping Information
                  </h3>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <p className="font-bold text-slate-900 text-lg mb-2 capitalize">
                      H.no. {selectedOrder.shippingAddress?.houseNo}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {selectedOrder.shippingAddress?.nearby},<br />
                      {selectedOrder.shippingAddress?.city},{" "}
                      {selectedOrder.shippingAddress?.state}
                      <br />
                      <span className="font-black text-slate-900">
                        PIN: {selectedOrder.shippingAddress?.pincode}
                      </span>
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                      <p className="text-sm flex items-center gap-2">
                        <span className="text-slate-500 font-medium">
                          Name:
                        </span>
                        <span className="font-bold text-slate-900">
                          {selectedOrder.user?.name ||
                            selectedOrder.guestName ||
                            "N/A"}
                        </span>
                      </p>
                      <p className="text-sm flex items-center gap-2">
                        <span className="text-slate-500 font-medium">
                          Email:
                        </span>
                        <span className="font-bold text-slate-900">
                          {selectedOrder.user?.email || "N/A"}
                        </span>
                      </p>

                      {/* PHONE & WHATSAPP SECTION */}
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm flex items-center gap-2">
                          <span className="text-slate-500 font-medium">
                            Phone:
                          </span>
                          <span className="font-bold text-slate-900">
                            {selectedOrder.user?.phoneNumber ||
                              selectedOrder.guestPhone ||
                              "N/A"}
                          </span>
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openWhatsappEditor(selectedOrder)}
                            className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                            title="Send WhatsApp"
                          >
                            <FaWhatsapp size={20} />
                          </button>
                          <a
                            href={`tel:${selectedOrder.user?.phoneNumber || selectedOrder.guestPhone}`}
                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                            title="Call Now"
                          >
                            <Phone size={18} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock size={14} /> Order Status
                  </h3>
                  <div className="flex gap-3">
                    <span
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${
                        selectedOrder.deliveryStatus === "Delivered"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-orange-50 text-orange-600 border-orange-100"
                      }`}
                    >
                      Delivery: {selectedOrder.deliveryStatus}
                    </span>
                    <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase border bg-blue-50 text-blue-600 border-blue-100">
                      Payment: {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    Order Items
                  </h3>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                    {selectedOrder.products.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"
                      >
                        <img
                          src={item.image}
                          className="w-14 h-14 object-contain rounded-lg border bg-slate-50"
                          alt="p"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800 leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                        <p className="font-black text-slate-900 text-xs">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-tight">
                      <span>Subtotal</span>
                      <span>₹{selectedOrder.subTotal}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-emerald-400 uppercase tracking-tight">
                      <span>Discount</span>
                      <span>- ₹{selectedOrder.discount}</span>
                    </div>
                    <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                      <span className="text-sm font-black uppercase tracking-widest">
                        Total Amount
                      </span>
                      <span className="text-2xl font-black">
                        ₹{selectedOrder.finalTotal}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- WHATSAPP MESSAGE EDITOR POPUP --- */}
      {isWhatsappModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight flex items-center gap-2">
                <FaWhatsapp className="text-green-500" size={20} /> Edit
                WhatsApp Message
              </h3>
              <button
                onClick={() => setIsWhatsappModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none font-medium text-slate-700"
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
            />
            <button
              onClick={sendWhatsapp}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-2xl transition-all uppercase text-xs tracking-widest"
            >
              Send to WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
