import React, { useState } from "react";
import { Search, MessageCircle } from "lucide-react";

const Inbox = () => {
  const [activeTab, setActiveTab] = useState("Customer");
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 md:p-10 bg-[#F9FAFB] min-h-screen">

      {/* Header */}
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        💬 Chatting List
      </h1>

      {/* Layout */}
      <div className="grid grid-cols-12 gap-6 h-[75vh]">

        {/* LEFT SIDEBAR */}
        <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">

          {/* Search */}
          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 rounded-lg pl-9 pr-3 py-2 outline-none"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b mb-4">
            {["Customer", "Delivery Man"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-slate-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List (empty for now) */}
          <div className="flex-1 overflow-y-auto text-sm text-slate-400 flex items-center justify-center">
            No users
          </div>
        </div>

        {/* RIGHT CHAT AREA */}
        <div className="col-span-9 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">

          <div className="text-center text-slate-500">
            <MessageCircle size={70} className="mx-auto mb-4 opacity-50" />
            <p>You haven’t any conversation yet</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Inbox;
