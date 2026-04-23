import React, { useState, useEffect } from "react";
import { User, ShoppingCart, MapPin, Save, X, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import instance from "./api/AxiosConfig";
import { useToast } from "../../context/ToastContext";

const UpdateProfile = () => {
  const { success, error } = useToast();
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("user")) || {}
  );
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [cart, setCart] = useState([]);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  // Address form state
  const [addressForm, setAddressForm] = useState({
    houseNo: "",
    nearby: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (!userData._id) {
      setFetchingData(false);
      return;
    }
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
        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(user));
        setUserData(user);
      }
    } catch (err) {
      console.error("Fetch user data error:", err);
      error("Failed to load user data");
    } finally {
      setFetchingData(false);
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

  // Update Address Only
  const handleAddressUpdate = async () => {
    if (!userData._id) {
      error("Please login again");
      return;
    }
    setLoading(true);
    try {
      const res = await instance.put(
        `/api/user/update-address/${userData._id}`,
        { address: addressForm }
      );
      if (res.data.success) {
        const updatedUser = { ...userData, address: addressForm };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(updatedUser);
        success("Address updated successfully!");
      }
    } catch (err) {
      console.error("Address update error:", err);
      error("Failed to update address");
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

  if (fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Account
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your profile, address, and cart
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex flex-wrap border-b">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "profile"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <User size={18} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("address")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "address"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <MapPin size={18} />
              Address
            </button>
            <button
              onClick={() => setActiveTab("cart")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "cart"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <ShoppingCart size={18} />
              My Cart
              {cart.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      setProfileForm({
                        ...profileForm,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your mobile number"
                  />
                </div>
              </div>
              <div className="mt-8">
                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          )}

          {/* Address Tab */}
          {activeTab === "address" && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Delivery Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House / Flat No.
                  </label>
                  <input
                    type="text"
                    value={addressForm.houseNo}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, houseNo: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 101, Block A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    value={addressForm.nearby}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, nearby: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Near City Mall"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, pincode: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter pincode"
                    maxLength={6}
                  />
                </div>
              </div>
              <div className="mt-8">
                <button
                  onClick={handleAddressUpdate}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Update Address
                </button>
              </div>
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === "cart" && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Shopping Cart
              </h2>
              {cart.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Add some products to your cart
                  </p>
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
                        <h3 className="font-medium text-gray-900 truncate">
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
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-medium w-8 text-center">
                          {item.quantity}
                        </span>
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
                        <p className="font-bold text-gray-900">
                          ₹
                          {(
                            (item.productId?.price || item.price || 0) *
                            item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() =>
                          removeFromCart(item.productId?._id || item.productId)
                        }
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  {/* Cart Summary */}
                  <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{calculateCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{calculateCartTotal().toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => (window.location.href = "/checkout")}
                      className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
