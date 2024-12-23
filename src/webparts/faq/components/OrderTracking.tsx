import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./OrderTracking.css";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { fetchOrder } from "../redux/slices/productsSlice";
import { RootState } from "../redux/store/store";

const OrderTracking: React.FC = () => {
  const orderItem = useSelector((state: RootState) => state.product.order);
  const [orderTitle, setOrderTitle] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleTrackOrder = async () => {
    if (!orderTitle) {
      alert("Please enter an order title.");
      return;
    }
    setIsLoading(true);
    try {
      await dispatch(fetchOrder({ OrderTitle: orderTitle }));
      setIsPopupVisible(true);
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Failed to fetch order details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePopup = () => {
    const overlay = document.getElementById("overlay");
    overlay?.classList.remove("visible");
    setTimeout(() => setIsPopupVisible(false), 300); // Match animation duration
  };

  const handleDownloadInvoice = () => {
    const element = document.getElementById("popupContainer");
    if (!element) {
      alert("Popup content is not available for download.");
      return;
    }

    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${orderTitle || "Order"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: "in", format: [8.5, 5.5], orientation: "portrait" },
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
    <div className="order-tracking">
      <h2 className="heading">Order Tracking</h2>
      <input
        type="text"
        placeholder="Enter Order Barcode"
        value={orderTitle}
        onChange={(e) => setOrderTitle(e.target.value)}
        className="order-input"
      />
      <button onClick={handleTrackOrder} className="track-button">
        {isLoading ? (
          <>
            Tracking...
            <img
              src="/sites/ECommerce/SiteAssets/small-spinner.gif"
              alt="Loading"
              style={{ marginLeft: "8px" }}
            />
          </>
        ) : (
          "Track"
        )}
      </button>

      {/* Popup for Order Details */}
      {isPopupVisible && orderItem && (
        <div
          id="overlay"
          className="overlay visible"
          onClick={handleClosePopup}
        >
          <div className="popup">
            <button onClick={handleClosePopup} className="close-button">
              X
            </button>
            <div
              id="popupContainer"
              className="popup-container"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Order Details</h3>
              <p>
                <strong>Order ID:</strong> {orderItem.Id}
              </p>
              <p>
                <strong>Order:</strong> {orderItem.Title}
              </p>
              <p>
                <strong>Product Data:</strong> {orderItem.ProductsQuantities}
              </p>
              <p>
                <strong>Total Price:</strong> ${orderItem.TotalPrice}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status ${getStatusClass(orderItem?.Status)}`}>
                  {orderItem?.Status || "Unknown"}
                </span>
              </p>
              <span className="sign">Coffee Box Company</span>
            </div>
            <button onClick={handleDownloadInvoice} className="download-button">
              <img
                src="/sites/ECommerce/SiteAssets/download.png"
                alt="download invoice"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
