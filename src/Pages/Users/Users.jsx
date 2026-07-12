import React, { useState, useEffect } from "react";
import "./Users.css";
import API from "../../api";

const ITEMS_PER_PAGE = 40;

const getTotalBalance = (user) => {
  const deposit = Number(user?.wallet?.balance || 0);
  const winnings = Number(user?.wallet?.winnings || 0);
  const totalBalance = Number(user?.wallet?.totalBalance || 0);

  return totalBalance || deposit + winnings || Number(user?.balance || 0);
};

const Users = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      const res = await API.get(`/admin/users?limit=50&search=${search}`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Fetch users error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const filteredUsers = users.filter((user) => {
    const status = user.status || "active";
    const phone = String(user.phone || user.mobile || "");
    const name = String(user.name || "");
    const referral = String(user.referralCode || "");
    const searchValue = search.trim().toLowerCase();

    const matchFilter = filter === "all" || status === filter;

    const matchSearch =
      !searchValue ||
      phone.toLowerCase().includes(searchValue) ||
      name.toLowerCase().includes(searchValue) ||
      referral.toLowerCase().includes(searchValue);

    return matchFilter && matchSearch;
  });

  // ---------- PAGINATION LOGIC ----------
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;

    let start = Math.max(1, safePage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  // ---------------------------------------

  const toggleBan = async (id) => {
    try {
      await API.patch(`/admin/block/${id}`);
      fetchUsers();
    } catch (err) {
      console.log("Block user error:", err.response?.data || err.message);
    }
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      await API.delete(`/admin/user/${id}`);
      fetchUsers();
    } catch (err) {
      console.log("Delete user error:", err.response?.data || err.message);
    }
  };

  const trackUser = async (phone) => {
    if (!phone || phone === "-") {
      alert("Is user ka mobile number nahi mila");
      return;
    }
    try {
      await API.post("/admin/tracked-accounts/add", { phone });
      alert("User Client Tracking mein add ho gaya");
    } catch (err) {
      alert(err.response?.data?.msg || "Track nahi ho paya");
    }
  };


  return (
    <div className="users-container">
      <h1>Users</h1>

      <input
        type="text"
        placeholder="Search by mobile number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="filters">
        <button
          className={filter === "all" ? "active-filter" : ""}
          onClick={() => setFilter("all")}
        >
          All Users
        </button>

        <button
          className={filter === "active" ? "active-filter" : ""}
          onClick={() => setFilter("active")}
        >
          Active
        </button>

        <button
          className={filter === "blocked" ? "active-filter" : ""}
          onClick={() => setFilter("blocked")}
        >
          Blocked
        </button>

        <button
          className={filter === "mismatch" ? "active-filter" : ""}
          onClick={() => setFilter("mismatch")}
        >
          Mismatch
        </button>
      </div>

      {filteredUsers.length > 0 && (
        <div className="result-count">
          Showing{" "}
          <strong>
            {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)}
          </strong>{" "}
          of <strong>{filteredUsers.length}</strong> users
        </div>
      )}

      <p className="scroll-hint">← Swipe left/right to see full table →</p>

      <div className="table-scroll">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Referral</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => {
                const status = user.status || "active";
                const phone = user.phone || user.mobile || "-";

                return (
                  <tr key={user._id}>
                    <td className="user-id">{user._id}</td>
                    <td>{user.name || "Player"}</td>
                    <td>{phone}</td>
                    <td>{user.referralCode || "-"}</td>
                    <td>
                      <div className="balance-line">
                        Deposit: ₹{Number(user?.wallet?.deposit || 0) + Number(user?.wallet?.bonus || 0)}
                      </div>
                      <div className="balance-line winning">
                        Winning: ₹{Number(user?.wallet?.winnings || 0)}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${status}`}>{status}</span>
                    </td>

                    <td>


                     <div className="action-buttons">
                        <button
                          className="view"
                          onClick={() => setSelectedUser(user)}
                        >
                          View
                        </button>

                        <button
                          className={status === "blocked" ? "unban" : "ban"}
                          onClick={() => toggleBan(user._id)}
                        >
                          {status === "blocked" ? "Unban" : "Ban"}
                        </button>

                        <button
                          className="track"
                          onClick={() => trackUser(phone)}
                        >
                          Track
                        </button>

                        <button
                          className="delete"
                          onClick={() => deleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </div>


                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredUsers.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn nav"
            onClick={() => goToPage(1)}
            disabled={safePage === 1}
          >
            « First
          </button>

          <button
            className="page-btn nav"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
          >
            ‹ Prev
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              className={`page-btn ${page === safePage ? "active" : ""}`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="page-btn nav"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
          >
            Next ›
          </button>

          <button
            className="page-btn nav"
            onClick={() => goToPage(totalPages)}
            disabled={safePage === totalPages}
          >
            Last »
          </button>
        </div>
      )}

      {selectedUser && (
        <div className="modal" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>User Details</h2>

            <p>
              <b>ID:</b> {selectedUser._id}
            </p>
            <p>
              <b>Name:</b> {selectedUser.name || "Player"}
            </p>
            <p>
              <b>Mobile:</b> {selectedUser.phone || selectedUser.mobile || "-"}
            </p>
            <p>
              <b>Referral:</b> {selectedUser.referralCode || "-"}
            </p>

            <p>
              <b>Deposit Balance:</b> ₹{Number(selectedUser?.wallet?.deposit || 0) + Number(selectedUser?.wallet?.bonus || 0)}
            </p>
            <p>
              <b>Winning Balance:</b> ₹{Number(selectedUser?.wallet?.winnings || 0)}
            </p>

            <p>
              <b>Status:</b>{" "}
              <span className={`status-badge inline ${selectedUser.status || "active"}`}>
                {selectedUser.status || "active"}
              </span>
            </p>

            <button onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
