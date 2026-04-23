import React, { useState, useEffect } from "react";
import {
  User,
  Package,
  MapPin,
  Power,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ShoppingCart,
  Save,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import instance, { getImageUrl } from "./api/AxiosConfig";
import { useToast } from "../../context/ToastContext";

const ProfilePage = () => {
  const { success, error } = useToast();
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("user")) || {},
  );
  const [activeTab, setActiveTab] = useState("orders");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [cart, setCart] = useState([]);

  // New state for validation errors
  const [errors, setErrors] = useState({});

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  // Define your limits here - max 30 characters for all fields
  const fieldLimits = {
    houseNo: 30,
    nearby: 30,
    city: 30,
    state: 30,
    pincode: 6, // Pincode stays 6 for valid Indian pincode
  };

  const [addressForm, setAddressForm] = useState(
    userData.address || {
      houseNo: "",
      nearby: "",
      city: "",
      state: "",
      pincode: "",
    },
  );



  useEffect(() => {
    // Always fetch latest user data on mount
    fetchUserData();
    
    if (activeTab === "orders" && userData._id) {
      fetchUserOrders();
    }
    if (activeTab === "cart" && userData._id) {
      fetchUserData();
    }
  }, [activeTab]);

  // Fetch user data including cart
  const fetchUserData = async () => {
    if (!userData._id) return;
    try {
      const res = await instance.get(`/api/user/${userData._id}`);
      if (res.data.success) {
        const user = res.data.data;
        setProfileForm({
          name: user.name || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
        });
        setAddressForm(user.address || {
          houseNo: "",
          nearby: "",
          city: "",
          state: "",
          pincode: "",
        });
        setCart(user.cart || []);
        localStorage.setItem("user", JSON.stringify(user));
        setUserData(user);
      }
    } catch (err) {
      console.error("Fetch user data error:", err);
      error("Failed to load user data");
    }
  };

  const fetchUserOrders = async () => {
    setFetchingOrders(true);
    try {
      const res = await instance.get(`/api/orders/user/${userData._id}`);
      setOrders(res.data.success ? res.data.data : []);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setFetchingOrders(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await instance.put(`/api/orders/update-status/${orderId}`, {
        status: newStatus,
      });
      if (res.data.success) {
        alert(`Order marked as ${newStatus}`);
        fetchUserOrders();
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const limit = fieldLimits[name];

    // Check if value exceeds limit
    if (value.length > limit) {
      setErrors((prev) => ({
        ...prev,
        [name]: `Maximum ${limit} characters allowed`,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setAddressForm({ ...addressForm, [name]: value });
  };

  const saveAddressToDB = async () => {
    // Prevent saving if there are active validation errors
    if (Object.keys(errors).length > 0) {
      return error("Please fix the errors before saving.");
    }

    if (!userData._id) {
      error("Please login again.");
      return;
    }
    setLoading(true);
    try {
      const response = await instance.put(
        `/api/user/update-address/${userData._id}`,
        {
          address: addressForm,
        },
      );
      if (response.data) {
        const updatedUser = { ...userData, address: addressForm };
        setUserData(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
        success("Address saved!");
      }
    } catch (error) {
      error("Update failed!");
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const handleProfileUpdate = async () => {
    if (!userData._id) {
      error("Please login again");
      return;
    }
    setLoading(true);
    try {
      const res = await instance.put(
        `/api/user/update-profile/${userData._id}`,
        {
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phoneNumber,
          address: addressForm,
        }
      );
      if (res.data.success) {
        const updatedUser = { ...userData, ...profileForm, address: addressForm };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(updatedUser);
        success("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Update error:", err);
      error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Cart Management
  const updateCartQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map((item) =>
      item.productId?._id === productId || item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    
    setCart(updatedCart);
    await saveCartToDB(updatedCart);
  };

  const removeFromCart = async (productId) => {
    const updatedCart = cart.filter(
      (item) =>
        (item.productId?._id !== productId && item.productId !== productId)
    );
    
    setCart(updatedCart);
    await saveCartToDB(updatedCart);
    success("Item removed from cart");
  };

  const saveCartToDB = async (updatedCart) => {
    if (!userData._id) return;
    try {
      await instance.put(`/api/user/update-cart/${userData._id}`, {
        cart: updatedCart,
      });
    } catch (err) {
      console.error("Cart update error:", err);
      error("Failed to update cart");
    }
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.productId?.price || item.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <div className="bg-[#f1f3f6] min-h-screen py-6 px-4 md:px-10 flex flex-col md:flex-row gap-4 text-black font-sans">
      {/* SIDEBAR */}
      <div className="w-full md:w-1/4 space-y-4">
        <div className="bg-white p-4 flex items-center gap-4 shadow-sm">
          <img
            src={
              userData.picture ||
              `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=random&color=fff`
            }
            className="w-12 h-12 rounded-full border shadow-sm"
            alt="User"
          />
          <div>
            <p className="text-xs text-gray-500">Hello,</p>
            <h2 className="font-bold text-lg">{userData.name}</h2>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-sm overflow-hidden">
          <div
            className={`p-4 border-b flex items-center justify-between cursor-pointer font-bold ${activeTab === "orders" ? "text-blue-600 bg-blue-50" : "text-gray-600"}`}
            onClick={() => setActiveTab("orders")}
          >
            <div className="flex items-center gap-3">
              <Package size={20} /> MY ORDERS
            </div>
            <ChevronRight size={18} />
          </div>
          <div
            className={`p-4 border-b flex items-center justify-between cursor-pointer font-bold ${activeTab === "cart" ? "text-blue-600 bg-blue-50" : "text-gray-600"}`}
            onClick={() => setActiveTab("cart")}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} /> MY CART
              {cart.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </div>
            <ChevronRight size={18} />
          </div>
          <div className="p-4 border-b">
            <div className="flex items-center gap-3 text-gray-400 font-bold mb-4 uppercase text-xs tracking-wider">
              <User size={20} /> Account Settings
            </div>
            <ul className="pl-8 space-y-4 text-sm font-medium">
              <li
                className={`cursor-pointer hover:text-blue-600 ${activeTab === "profile" ? "text-blue-600 font-bold" : "text-gray-600"}`}
                onClick={() => setActiveTab("profile")}
              >
                Profile Information
              </li>
              <li
                className={`cursor-pointer hover:text-blue-600 ${activeTab === "address" ? "text-blue-600 font-bold" : "text-gray-600"}`}
                onClick={() => setActiveTab("address")}
              >
                Manage Addresses
              </li>
            </ul>
          </div>
          <div
            className="p-4 flex items-center gap-3 text-gray-600 font-bold cursor-pointer hover:text-red-600"
            onClick={() => {
              localStorage.clear();
              success("Logged out successfully");
              setTimeout(() => {
                window.location.href = "/";
              }, 1000);
            }}
          >
            <Power size={20} /> LOGOUT
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full md:w-3/4 bg-white p-6 shadow-sm min-h-[500px] rounded-sm">
        {activeTab === "address" && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-slate-800">
              Manage Addresses
            </h3>
            {!isEditing ? (
              <>
                <div
                  className="border p-4 rounded-sm border-dashed border-blue-600 text-blue-600 cursor-pointer text-center font-bold mb-6 hover:bg-blue-50 transition-all"
                  onClick={() => setIsEditing(true)}
                >
                  +{" "}
                  {userData.address?.city
                    ? "EDIT ADDRESS"
                    : "ADD A NEW ADDRESS"}
                </div>
                {userData.address?.city && (
                  <div className="border p-5 bg-slate-50 rounded-sm">
                    <p className="font-bold text-slate-900">{userData.name}</p>
                    <p className="text-sm text-gray-700 mt-2">
                      {userData.address.houseNo}, {userData.address.nearby},
                      <br />
                      {userData.address.city}, {userData.address.state} -{" "}
                      <b>{userData.address.pincode}</b>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4 bg-gray-50 p-6 rounded-sm border text-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* House No */}
                  <div className="flex flex-col gap-1">
                    <input
                      name="houseNo"
                      placeholder="House No"
                      className={`border p-3 rounded bg-white ${errors.houseNo ? "border-red-500" : ""}`}
                      value={addressForm.houseNo}
                      onChange={handleInputChange}
                    />
                    {errors.houseNo && <span className="text-red-500 text-[10px] ml-1">{errors.houseNo}</span>}
                  </div>

                  {/* Landmark */}
                  <div className="flex flex-col gap-1">
                    <input
                      name="nearby"
                      placeholder="Landmark"
                      className={`border p-3 rounded bg-white ${errors.nearby ? "border-red-500" : ""}`}
                      value={addressForm.nearby}
                      onChange={handleInputChange}
                    />
                    {errors.nearby && <span className="text-red-500 text-[10px] ml-1">{errors.nearby}</span>}
                  </div>

                  {/* City */}
                  <div className="flex flex-col gap-1">
                    <input
                      name="city"
                      placeholder="City"
                      className={`border p-3 rounded bg-white ${errors.city ? "border-red-500" : ""}`}
                      value={addressForm.city}
                      onChange={handleInputChange}
                    />
                    {errors.city && <span className="text-red-500 text-[10px] ml-1">{errors.city}</span>}
                  </div>

                  {/* State */}
                  <div className="flex flex-col gap-1">
                    <input
                      name="state"
                      placeholder="State"
                      className={`border p-3 rounded bg-white ${errors.state ? "border-red-500" : ""}`}
                      value={addressForm.state}
                      onChange={handleInputChange}
                    />
                    {errors.state && <span className="text-red-500 text-[10px] ml-1">{errors.state}</span>}
                  </div>

                  {/* Pincode */}
                  <div className="flex flex-col gap-1">
                    <input
                      name="pincode"
                      placeholder="Pincode"
                      type="number"
                      className={`border p-3 rounded bg-white ${errors.pincode ? "border-red-500" : ""}`}
                      value={addressForm.pincode}
                      onChange={handleInputChange}
                    />
                    {errors.pincode && <span className="text-red-500 text-[10px] ml-1">{errors.pincode}</span>}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={saveAddressToDB}
                    disabled={Object.keys(errors).length > 0}
                    className={`px-10 py-3 font-bold uppercase shadow-sm text-white ${Object.keys(errors).length > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#fb641b]"}`}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                    }}
                    className="text-gray-600 font-bold uppercase px-6"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="animate-in slide-in-from-right duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-800">
              Profile Information
            </h3>
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phoneNumber}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phoneNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your mobile number"
                />
              </div>
              <div className="pt-4">
                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#fb641b] text-white px-6 py-3 rounded-lg font-bold uppercase hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === "cart" && (
          <div className="animate-in slide-in-from-right duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-800">
              Shopping Cart
            </h3>
            {cart.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <ShoppingCart className="mx-auto text-slate-300 mb-4" size={64} />
                <p className="text-slate-500 font-medium">Your cart is empty</p>
                <p className="text-slate-400 text-sm mt-1">Add some products to your cart</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-xl bg-white hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.productId?.image || item.image ? (
                        <img
                          src={item.productId?.image || item.image}
                          alt={item.productId?.name || item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingCart className="text-gray-300" size={24} />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">
                        {item.productId?.name || item.name || "Product"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        ₹{item.productId?.price || item.price || 0} per item
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.productId?._id || item.productId,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.productId?._id || item.productId,
                            item.quantity + 1
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-right min-w-[80px]">
                      <p className="font-bold text-slate-900">
                        ₹{((item.productId?.price || item.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.productId?._id || item.productId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {/* Cart Summary */}
                <div className="mt-6 p-6 bg-slate-50 rounded-xl border">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{calculateCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-[#fb641b]">
                      ₹{calculateCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => (window.location.href = "/checkout")}
                    className="w-full mt-6 bg-[#fb641b] text-white py-3 rounded-lg font-bold uppercase hover:bg-orange-600 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab remains exactly as you provided */}
        {activeTab === "orders" && (
            // ... (Your existing Orders code)
            <div className="animate-in slide-in-from-right duration-300">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                My Orders{" "}
                {fetchingOrders && (
                    <Loader2 className="animate-spin text-blue-600" size={18} />
                )}
                </h3>
                {/* ... rest of order list map logic ... */}
                {orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order) => (
                             <div key={order._id} className="border rounded-xl overflow-hidden bg-white shadow-sm border-slate-200">
                                {/* Your existing order card UI */}
                                <div className="bg-slate-50 p-4 border-b flex flex-col md:flex-row justify-between gap-3">
                                    <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                                        <p>Order ID: <span className="text-slate-900">#{order._id.slice(-8).toUpperCase()}</span></p>
                                        <p>Placed On: {new Date(order.orderDate).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${order.deliveryStatus === "Delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}>
                                            ● {order.deliveryStatus}
                                        </span>
                                    </div>
                                </div>
                                {/* ... Action Buttons ... */}
                                <div className="p-4 bg-white border-t flex flex-wrap gap-3">
                                    {order.deliveryStatus === "Delivered" ? (
                                        <div className="flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200">
                                            <CheckCircle2 size={14} />
                                            Order Delivered ✓
                                        </div>
                                    ) : (
                                        <div className="flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 bg-orange-50 text-orange-600 border border-orange-200">
                                            <Package size={14} />
                                            {order.deliveryStatus || "Processing"} - Admin will update soon
                                        </div>
                                    )}
                                    <button onClick={() => alert("Reporting issue for order #" + order._id)} className="flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase border border-red-200 text-red-500 hover:bg-red-50 transition-all">
                                        <XCircle size={14} /> Report Issue
                                    </button>
                                </div>
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <Package className="mx-auto text-slate-300 mb-4" size={60} />
                        <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No orders found</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;