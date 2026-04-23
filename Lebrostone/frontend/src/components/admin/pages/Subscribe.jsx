import React, { useEffect, useState } from "react";
import instance from "../../web/api/AxiosConfig";

const Subscribe = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    try {
      const res = await instance.get("/api/subscription/getall");
      setEmails(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // 🔴 Delete Function
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subscriber?"
    );

    if (!confirmDelete) return;

    try {
      await instance.delete(`/api/subscription/delete/${id}`);

      // ✅ Remove from UI instantly
      setEmails((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete subscriber");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Subscribers</h1>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading subscribers...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Email</th>
                <th className="p-4">Subscribed On</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {emails.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-500">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                emails.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{index + 1}</td>

                    <td className="p-4 text-blue-600 font-medium">
                      {item.email}
                    </td>

                    <td className="p-4 text-gray-600">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>

                    {/* 🔴 Delete Button */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Subscribe;
