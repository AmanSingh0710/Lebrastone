import React, { useState } from "react";

const gateways = [
  { name: "Razorpay" },
  { name: "PhonePe" },
  { name: "Paytm" },
];

const Paymentpage = () => {
  const [data, setData] = useState({
    Razorpay: { enabled: false, mode: "Live", key1: "", key2: "", title: "", logo: null },
    PhonePe: { enabled: false, mode: "Live", key1: "", key2: "", title: "", logo: null },
    Paytm: { enabled: false, mode: "Live", key1: "", key2: "", title: "", logo: null },
  });

  const handleChange = (gateway, field, value) => {
    setData((prev) => ({
      ...prev,
      [gateway]: { ...prev[gateway], [field]: value },
    }));
  };

  const handleSave = (gateway) => {
    console.log("Save:", gateway, data[gateway]);

    // 🔥 API call here
    // instance.post("/api/payment/save", { gateway, ...data[gateway] })
  };

  return (
    <div className="p-6 md:p-10 bg-[#F9FAFB] min-h-screen">

      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        3rd Party Payment Methods
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {gateways.map(({ name }) => {
          const g = data[name];

          return (
            <div
              key={name}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold uppercase text-sm">{name}</h3>

                {/* Toggle */}
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={g.enabled}
                    onChange={(e) =>
                      handleChange(name, "enabled", e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div className="w-10 h-5 bg-gray-300 rounded-full relative">
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition ${
                        g.enabled ? "translate-x-5 bg-blue-600" : ""
                      }`}
                    />
                  </div>
                </label>
              </div>

              {/* Mode */}
              <select
                value={g.mode}
                onChange={(e) => handleChange(name, "mode", e.target.value)}
                className="w-full bg-slate-50 p-2 rounded mb-3 border"
              >
                <option>Live</option>
                <option>Test</option>
              </select>

              {/* Keys */}
              <input
                placeholder="Key ID"
                value={g.key1}
                onChange={(e) => handleChange(name, "key1", e.target.value)}
                className="w-full bg-slate-50 p-2 rounded mb-3 border"
              />

              <input
                placeholder="Secret Key"
                value={g.key2}
                onChange={(e) => handleChange(name, "key2", e.target.value)}
                className="w-full bg-slate-50 p-2 rounded mb-3 border"
              />

              {/* Title */}
              <input
                placeholder="Payment Gateway Title"
                value={g.title}
                onChange={(e) => handleChange(name, "title", e.target.value)}
                className="w-full bg-slate-50 p-2 rounded mb-3 border"
              />

              {/* Logo Upload */}
              <input
                type="file"
                onChange={(e) =>
                  handleChange(name, "logo", e.target.files[0])
                }
                className="mb-4"
              />

              {/* Save Button */}
              <button
                onClick={() => handleSave(name)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Paymentpage;
