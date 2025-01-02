import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../redux/slices/userSlice";
import { RootState } from "../redux/store/store";
import { IOrder } from "../../../IOrder";
import "./UserOrders.css";
// @ts-ignore
import html2pdf from "html2pdf.js";
const UserOrders: React.FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.user.userOrders);
  const [userOrders, setUserOrders] = useState<IOrder[] | null>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) throw new Error("No user data found. Please log in.");
        const user = JSON.parse(userData);
        await dispatch(fetchUserOrders({ UserId: user.ID }));
      } catch (error) {
        console.error("Error fetching user Orders:", error);
        setUserOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [dispatch]);

  useEffect(() => {
    if (orders) {
      setUserOrders(orders);
    }
  }, [orders]);

  const downloadInvoice = (orderTitle: string) => {
    const element = document.getElementById(`order-details-${orderTitle}`);
    if (!element) {
      alert("Order details are not available for download.");
      return;
    }

    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${orderTitle || "Order"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: "in", format: [4.5, 5.5], orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };

  const getStatusClass = (status: string | undefined): string => {
    if (!status) return "unknown";
    switch (status.toLowerCase()) {
      case "completed":
        return "completed";
      case "pending":
        return "pending";
      case "cancelled":
        return "cancelled";
      case "shipped":
        return "shipped";
      default:
        return "unknown";
    }
  };

  return (
    <div className="user-orders-container">
      <h2 style={{ textAlign: "center" }}>Your Orders</h2>
      {loading ? (
        <div className="spinner d-flex">
          <img
            className="m-auto"
            src="/sites/ECommerce/SiteAssets/Spinner.gif"
            alt="Loading..."
            style={{ width: "100px", height: "100px" }}
          />
        </div>
      ) : (
        <div className="orders-list">
          {userOrders?.map((order, index) => (
            <div className="order-card" key={order.Id}>
              {index === 0 && <span className="new-badge">New</span>}
              <div
                id={`order-details-${order.Title}`}
                className="order-details"
              >
                <h3 className="order-title">{order.Title}</h3>
                <p>
                  <strong>Products:</strong> {order.ProductsQuantities}
                </p>
                <p>
                  <strong>Total Price:</strong> ${order.TotalPrice}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status ${getStatusClass(order?.Status)}`}>
                    {" "}
                    {order.Status}
                  </span>
                </p>
                <p>
                  <strong>Address:</strong> {order.Address}
                </p>
                <p className="signature">CoffeBox Company</p>
              </div>
              <abbr title="Download Invoice">
                {order.Status?.toLowerCase() === "completed" && (
                  <button
                    onClick={() => downloadInvoice(order.Title)}
                    className="download-button btn-visible"
                  >
                    <img
                      src="/sites/ECommerce/SiteAssets/download.png"
                      alt="download invoice"
                    />
                  </button>
                )}
              </abbr>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
