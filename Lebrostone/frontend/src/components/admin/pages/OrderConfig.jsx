import React, { useState } from "react";
import { Users } from "lucide-react";

const tabs = [
  "Social Media Chat",
  "Social Media Login",
  "Mail Config",
  "SMS Config",
  "Recaptcha",
  "Google Map APIs",
  "Analytic Scripts",
];

const OrderConfig = () => {
  const [activeTab, setActiveTab] = useState("Social Media Chat");

  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [number, setNumber] = useState("");

  const handleReset = () => {
    setWhatsappEnabled(false);
    setNumber("");
  };

  const handleSave = () => {
    const data = {
      enabled: whatsappEnabled,
      whatsappNumber: number,
    };

    console.log("Save:", data);

    // 🔥 API call here
    // instance.post("/api/thirdparty/whatsapp", data)
  };

  return (
    <div className="p-6 md:p-10 bg-[#F9FAFB] min-h-screen">

      {/* Header */}
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
        <Users className="text-blue-600" />
        3rd Party
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-6 border-b mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-semibold ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-blue-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content (Only WhatsApp Tab Implemented) */}
      {activeTab === "Social Media Chat" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl">

          {/* Card Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              🟢 WhatsApp
            </h3>

            {/* Toggle */}
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="sr-only"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full relative">
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${
                    whatsappEnabled ? "translate-x-5 bg-blue-600" : ""
                  }`}
                />
              </div>
            </label>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              WhatsApp Number
            </label>

            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter WhatsApp number"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 rounded-lg bg-gray-200 text-slate-700 hover:bg-gray-300"
            >
              Reset
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderConfig;
