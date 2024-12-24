import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { addOrder } from "../redux/slices/productsSlice";
import {
  clearUserCart,
  fetchUserAddress,
  clearCart,
} from "../redux/slices/userSlice";
import { IAddress } from "../../../IAddress";
import CustomAlert from "./CustomAlert";
const Order: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems, quantities, totalPrice } = location.state || {};
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const messageRef = useRef<HTMLDivElement | null>(null);
  const [loadingCheckOut, setLoadingCheckOut] = useState<boolean>(false);
  const adress = useSelector((state: RootState) => state.user.address);
  const [userAddresses, setUserAddresses] = useState<IAddress[] | null>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) throw new Error("No user data found. Please log in.");
        const user = JSON.parse(userData);
        const addresses = await dispatch(fetchUserAddress({ UserId: user.ID }));
        console.log("From redux addresses is ", addresses);
        console.log("From redux adress is ", adress);
        setUserAddresses(adress);
      } catch (error) {
        console.error("Error fetching user addresses:", error);
        setUserAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);
  useEffect(() => {
    if (successMessage && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [successMessage]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAddress(parseInt(e.target.value, 10));
  };

  const handleOrder = async () => {
    setLoadingCheckOut(true);
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        alert("No user data found. Please log in.");
        return;
      }
      const user = JSON.parse(userData);
      const userId = user.ID;
      const userGUID = user.GUID;
      if (!userId) {
        alert("User is not logged in. Please log in to continue.");
        return;
      }

      const productIds = cartItems.map((item: any) => item.Id);
      const productsQuantities = cartItems
        .map((item: any) => `${item.Title}[${quantities[item.Id] || 1}]`)
        .join(",");

      const resultAction = await dispatch(
        addOrder({
          User: parseInt(userId),
          ProductData: productIds,
          ProductsQuantities: productsQuantities,
          TotalPrice: totalPrice,
          Status: "Pending",
        })
      );
      if (addOrder.fulfilled.match(resultAction)) {
        const newOrderId = resultAction.payload.Id;
        console.log("New Order ID:", newOrderId);
        await dispatch(clearUserCart({ userGUID, newOrderId }));
      }
      setSuccessMessage("Order placed successfully!");
      dispatch(clearCart());
      navigate("/home");
    } catch (error) {
      alert("Failed to place the order. Please try again.");
    } finally {
      setLoadingCheckOut(false);
    }
  };

  return (
    <div className="container my-5">
      <h2 style={{ textAlign: "center" }}>Your Order</h2>
      <CustomAlert
        ref={messageRef}
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
      <table className="table table-responsive table-bordered">
        <thead>
          <tr>
            <th></th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item: any) => (
            <tr key={item.Id}>
              <td>
                <img
                  src={item.Image}
                  alt={item.Title}
                  style={{ width: "100px", height: "auto" }}
                />
              </td>
              <td>{item.Title}</td>
              <td>{quantities[item.Id] || 1}</td>
              <td>${(item.Price * (quantities[item.Id] || 1)).toFixed(2)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>
              Total Price
            </td>
            <td>${totalPrice.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ width: "50%", margin: "auto" }}>
        <label htmlFor="address">Select Address:</label>
        <select
          id="address"
          className="form-control"
          value={selectedAddress || ""}
          onChange={handleAddressChange}
          disabled={loading}
        >
          <option value="" disabled>
            {loading ? "Loading addresses..." : "Select an address"}
          </option>
          {userAddresses?.map((address) => (
            <option key={address.Id} value={address.Id}>
              {`${address.BuildingNumber}, ${address.Street}, ${address.City}, ${address.Country}`}
            </option>
          ))}
        </select>
      </div>

      <button
        className="mx-auto d-flex mt-2"
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "5px 15px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
          background: "linear-gradient(to right, #56ab2f, #a8e063)",
        }}
        onClick={handleOrder}
      >
        Place Order
        {loadingCheckOut && (
          <img
            src="/sites/ECommerce/SiteAssets/small-spinerr.gif"
            style={{ marginLeft: "8px" }}
          />
        )}
      </button>
    </div>
  );
};

export default Order;
