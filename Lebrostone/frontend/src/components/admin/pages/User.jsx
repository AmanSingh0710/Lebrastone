import React, { useState, useEffect } from "react";
import instance from "../../web/api/AxiosConfig";
import { useToast } from "../../../context/ToastContext";
import { Pencil, Trash2, Lock, Unlock } from "lucide-react";

const User = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // UPDATE STATE
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // DELETE STATE
  const [deleteUserId, setDeleteUserId] = useState(null);

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.includes(searchTerm)
  );

  // ================= FETCH USERS =================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/api/user/all");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      error(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= UPDATE =================

  const openEditModal = (user) => {
    setEditUser(user);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editUser.name || !editUser.email) {
      error("Name and email are required");
      return;
    }

    try {
      await instance.put(
        `/api/user/update-profile/${editUser._id}`,
        editUser
      );

      success("User updated successfully");
      setIsEditOpen(false);
      fetchUsers();
    } catch (err) {
      error(err.message || "Failed to update user");
    }
  };

  // ================= DELETE =================

  const confirmDelete = async () => {
    try {
      await instance.delete(
        `/api/user/delete-user/${deleteUserId}`
      );

      success("User deleted successfully");
      setDeleteUserId(null);
      fetchUsers();
    } catch (err) {
      error(err.message || "Failed to delete user");
    }
  };

  // ================= BLOCK/UNBLOCK =================

  const handleBlockUnblock = async (userId, isBlocked) => {
    try {
      const endpoint = isBlocked ? `/api/user/unblock/${userId}` : `/api/user/block/${userId}`;
      await instance.put(endpoint);
      success(isBlocked ? "User unblocked successfully" : "User blocked successfully");
      fetchUsers();
    } catch (err) {
      error(err.message || "Failed to update user status");
    }
  };

  // ================= UI =================

  if (loading)
    return (
      <div className="p-10 text-center text-xl font-bold">
        Loading Users...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Title and Total Users */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">
          User Management
        </h2>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">Total Users: </span>
          <span className="text-lg font-bold">{users.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-3 text-xs w-1/4">Name</th>
              <th className="p-3 text-xs w-1/4">Email</th>
              <th className="p-3 text-xs w-1/6">Mobile</th>
              <th className="p-3 text-xs w-1/12">Status</th>
              <th className="p-3 text-xs text-center w-1/6">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
              <tr
                key={user._id}
                className={`hover:bg-gray-50 ${user.isBlocked ? 'bg-red-50' : ''}`}
              >
                <td className="p-3 font-medium text-sm truncate max-w-xs">
                  {user.name}
                </td>

                <td className="p-3 text-slate-600 text-sm truncate max-w-xs">
                  {user.email}
                </td>

                <td className="p-3 text-slate-600 text-sm">
                  {user.phoneNumber || "N/A"}
                </td>

                <td className="p-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    user.isBlocked 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>

                {/* ===== ACTION BUTTONS ===== */}

                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleBlockUnblock(user._id, user.isBlocked)}
                      className={`p-2 rounded transition-colors ${
                        user.isBlocked
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                      title={user.isBlocked ? "Unblock User" : "Block User"}
                    >
                      {user.isBlocked ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>

                    <button
                      onClick={() =>
                        setDeleteUserId(user._id)
                      }
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== UPDATE MODAL ===== */}

      {isEditOpen && editUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 space-y-3">
            <h3 className="text-xl font-bold">
              Update User
            </h3>

            <input
              value={editUser.name}
              onChange={(e) =>
                setEditUser({
                  ...editUser,
                  name: e.target.value,
                })
              }
              className="w-full border p-2 rounded"
              placeholder="Name"
            />

            <input
              value={editUser.email}
              onChange={(e) =>
                setEditUser({
                  ...editUser,
                  email: e.target.value,
                })
              }
              className="w-full border p-2 rounded"
              placeholder="Email"
            />

            <input
              value={editUser.phone || ""}
              onChange={(e) =>
                setEditUser({
                  ...editUser,
                  phone: e.target.value,
                })
              }
              className="w-full border p-2 rounded"
              placeholder="Phone"
            />

            <textarea
              value={editUser.address || ""}
              onChange={(e) =>
                setEditUser({
                  ...editUser,
                  address: e.target.value,
                })
              }
              className="w-full border p-2 rounded"
              placeholder="Address"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRM ===== */}

      {deleteUserId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center space-y-4">
            <h3 className="text-xl font-bold text-red-600">
              Delete this user?
            </h3>

            <div className="space-x-3">
              <button
                onClick={() => setDeleteUserId(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Yes Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
