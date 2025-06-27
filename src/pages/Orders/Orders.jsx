import { useEffect, useState } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
const Orders = ({ url }) => {
  const [order, setOrder] = useState([]);

  const fetchAllOrders = async () => {
    const res = await axios.post(`${url}/api/order/list`);
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

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="orders add">
      <h3>Order Page</h3>
      <div className="order-list">
        {order.map((order, index) => (
          <div className="order-item" key={index}>
            <img src={assets.parcel_icon} alt={"parcel"} />
            <div>
              <p className="order-item-food">
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity;
                  } else {
                    return item.name + " x " + item.quantity + ", ";
                  }
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
            </div>
            <p>Items : {order.items.length}</p>
            <p>${order.amount}</p>
            <select
              onChange={(e) => statusHandler(order._id, e)}
              value={order.status}
            >
              <option value="Food processing">Food processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
