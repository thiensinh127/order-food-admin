import React, { useEffect, useState } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
const ConfirmModal = React.lazy(() => import("../../common/ConfirmModal/ConfirmModal"));

const Orders = ({ url }) => {
  const [order, setOrder] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  // Deletion state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAllOrders = async () => {
    let query = `${url}/api/order/list?status=${status}`;
    if (search) query += `&search=${search}`;

    const res = await axios.post(query); // Keeping POST as per original code, though standard is GET for list
    if (res.data.success) {
      setOrder(res.data.data);
    } else {
      toast.error("Something went wrong");
    }
  };

  const statusHandler = async (orderId, e) => {
    const status = e.target.value;
    const res = await axios.post(`${url}/api/order/status`, {
      orderId,
      status,
    });
    if (res.data.success) {
      toast.success(res.data.message);
      fetchAllOrders();
    } else {
      toast.error(res.data.message);
    }
  };

  const deleteOrder = async () => {
    if (!orderToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await axios.post(`${url}/api/order/delete`, { orderId: orderToDelete });
      if (res.data.success) {
        toast.success(res.data.message);
        setIsConfirmOpen(false);
        fetchAllOrders();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Error deleting order");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [status]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAllOrders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h3>Order Page</h3>
        <div className="orders-filters">
          <input
            type="text"
            placeholder="Search by name..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Food processing">Food processing</option>
            <option value="Out for delivery">Out for delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="order-list">
        {order.length === 0 ? (
          <p className="no-orders text-center">No orders found.</p>
        ) : (
          order.map((order, index) => (
            <div className="order-item" key={index}>
              <img src={assets.parcel_icon} alt={"parcel"} />
              <div className="order-details">
                <p className="order-item-food">
                  {order.items.map((item, idx) => {
                    return item.name + " x " + item.quantity + (idx === order.items.length - 1 ? "" : ", ");
                  })}
                </p>
                <p className="order-item-name">
                  {order.address.firstName + " " + order.address.lastName}
                </p>
                <div className="order-item-address">
                  <p>{order.address.street + ", "}</p>
                  <p>
                    {order.address.city +
                      ", " +
                      order.address.state +
                      ", " +
                      order.address.city}
                  </p>
                </div>
                <p className="order-item-phone">{order.address.phone}</p>
                <p className="order-item-date">
                  {new Date(order.date).toLocaleString()}
                </p>
              </div>
              <div className="order-meta">
                <p>Items : {order.items.length}</p>
                <p className="order-amount">${order.amount}</p>
              </div>
              <div className="order-item-actions">
                <select
                  className="status-select"
                  onChange={(e) => statusHandler(order._id, e)}
                  value={order.status}
                >
                  <option value="Food processing">Food processing</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <button
                  className="delete-btn"
                  onClick={() => { setOrderToDelete(order._id); setIsConfirmOpen(true); }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isConfirmOpen && (
        <ConfirmModal
          open={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={deleteOrder}
          loading={deleteLoading}
          title="Delete Order"
          message="Are you sure you want to delete this order? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default Orders;
