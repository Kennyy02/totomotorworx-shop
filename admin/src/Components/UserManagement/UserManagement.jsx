import React, { useEffect, useState, useCallback } from "react";
import "./UserManagement.css";

const API_BASE = "https://totomotorworx-shop-production.up.railway.app";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`);
      const data = await res.json();
      const processedUsers = data.map((user) => ({
        ...user,
        password: "******",
      }));
      setUsers(processedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Disable user
  const disableUser = async (id) => {
    if (!window.confirm("Disable this user? They will not be able to log in.")) return;
    try {
      const res = await fetch(`${API_BASE}/users/disable/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to disable user");
      alert("User disabled successfully!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error disabling user");
    }
  };

  // Enable user
  const enableUser = async (id) => {
    if (!window.confirm("Re-enable this user account?")) return;
    try {
      const res = await fetch(`${API_BASE}/users/enable/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to enable user");
      alert("User enabled successfully!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error enabling user");
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="user-management-container">
      <h2>User Management</h2>

      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 && !error ? (
        <p>No users found in the database.</p>
      ) : (
        <>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Registered Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td data-label="ID">{user.id}</td>
                  <td data-label="Name">{user.name}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Password">{user.password}</td>
                  <td data-label="Registered Date">{new Date(user.date).toLocaleDateString()}</td>
                  <td data-label="Status">{user.disabled ? "Disabled" : "Active"}</td>
                  <td data-label="Action">
                    {user.disabled ? (
                      <button
                        className="enable-button"
                        onClick={() => enableUser(user.id)}
                      >
                        Enable
                      </button>
                    ) : (
                      <button
                        className="disable-button"
                        onClick={() => disableUser(user.id)}
                      >
                        Disable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}