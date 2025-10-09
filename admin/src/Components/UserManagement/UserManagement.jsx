import React, { useEffect, useState, useCallback } from "react";
import "./UserManagement.css"; // Make sure this CSS file exists for styling

// Define your API base URL
const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5; // Change this number for different page sizes

  // fetchUsers is useCallback memoized
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error ||
            errData.errors ||
            `Failed to fetch users: ${res.statusText}`
        );
      }

      const data = await res.json();
      // Ensure password is obfuscated
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

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({ name: user.name, email: user.email, password: "" });
    setShowPasswordInput(false);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setFormData({ name: "", email: "", password: "" });
    setShowPasswordInput(false);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitEdit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and Email are required to update a user.");
      return;
    }

    setError(null);
    const payload = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.password.trim()) {
      payload.password = formData.password;
    }

    try {
      const res = await fetch(`${API_BASE}/users/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error ||
            errData.errors ||
            `Failed to update user: ${res.statusText}`
        );
      }

      alert("User updated successfully!");
      cancelEdit();
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      setError(`Failed to update user: ${err.message}`);
    }
  };

  const deleteUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    setError(null);
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error ||
            errData.errors ||
            `Failed to delete user: ${res.statusText}`
        );
      }
      alert("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(`Failed to delete user: ${err.message}`);
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) =>
                editingUserId === user.id ? (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Name"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                      />
                    </td>
                    <td>
                      <button
                        className="change-password-toggle"
                        onClick={() =>
                          setShowPasswordInput(!showPasswordInput)
                        }
                      >
                        {showPasswordInput ? "Hide Password" : "Change Password"}
                      </button>
                      {showPasswordInput && (
                        <div className="password-input-group">
                          <input
                            type="password"
                            name="password"
                            placeholder="New Password (optional)"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                          />
                        </div>
                      )}
                    </td>
                    <td>{new Date(user.date).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={submitEdit} className="save-button">
                          Save
                        </button>
                        <button onClick={cancelEdit} className="cancel-button">
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.password}</td>
                    <td>{new Date(user.date).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => startEdit(user)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
