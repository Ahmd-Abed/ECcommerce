import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { addOrder } from "../redux/slices/productsSlice";
import {
  clearUserCart,
  fetchUserAddress,
  clearCart,
  addUserAddress,
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
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [newAddress, setNewAddress] = useState({
    Country: "",
    City: "",
    Street: "",
    BuildingNumber: "",
  });
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) throw new Error("No user data found. Please log in.");
        const user = JSON.parse(userData);
        await dispatch(fetchUserAddress({ UserId: user.ID }));
      } catch (error) {
        console.error("Error fetching user addresses:", error);
        setUserAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [dispatch]);

  useEffect(() => {
    if (adress) {
      setUserAddresses(adress);
    }
  }, [adress]);

  useEffect(() => {
    if (successMessage && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [successMessage]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAddress(parseInt(e.target.value, 10));
  };

  //handleAddAddress
  const handleAddAddress = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("No user data found. Please log in.");
      return;
    }

    const user = JSON.parse(userData);
    const addressData = {
      ...newAddress,
      BuildingNumber: parseInt(newAddress.BuildingNumber, 10),
      UserId: user.ID,
    };

    try {
      setLoading(true);
      await dispatch(addUserAddress(addressData));
      setNewAddress({ Country: "", City: "", Street: "", BuildingNumber: "" });
      setIsPopupVisible(false);
      setSuccessMessage("Address Added successfully!");
      dispatch(fetchUserAddress({ UserId: user.ID })); // Refresh addresses
    } catch (error) {
      alert("Failed to add address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setNewAddress({ Country: "", City: "", Street: "", BuildingNumber: "" });
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
      const filteredAddresses = userAddresses?.filter(
        (address) => address.Id === selectedAddress
      );

      if (!filteredAddresses || filteredAddresses.length === 0) {
        alert("Please select a valid address.");
        return;
      }
      const selectedAddressObj = filteredAddresses[0];
      const formattedAddress = `${selectedAddressObj.BuildingNumber}, ${selectedAddressObj.Street}, ${selectedAddressObj.City}, ${selectedAddressObj.Country}`;

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
          Address: formattedAddress,
        })
      );
      if (addOrder.fulfilled.match(resultAction)) {
        const newOrderId = resultAction.payload.Id;
        console.log("New Order ID:", newOrderId);
        await dispatch(clearUserCart({ userGUID, newOrderId }));
      }
      setSuccessMessage("Order placed successfully!");
      dispatch(clearCart());
      setTimeout(() => {
        navigate("/home");
      }, 2000);
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
      <div style={{ width: "40%", margin: "auto" }}>
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
        style={{
          margin: "auto",
          display: "block",
          marginTop: "10px",
          fontSize: "12px",
          background: "transparent",
          color: "#5f4949 ",
          border: "1px solid #713838 ",
          padding: "5px 10px",
          borderRadius: "5px",
        }}
        onClick={() => setIsPopupVisible(true)}
      >
        Add New Address
      </button>

      {isPopupVisible && (
        <div
          id="overlay"
          className="overlay visible"
          onClick={handleClosePopup}
        >
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleClosePopup} className="close-button">
              X
            </button>
            <h3>Add New Address</h3>
            <form>
              <div className="form-group">
                <label>Country:</label>
                <input
                  type="text"
                  className="form-control"
                  value={newAddress.Country}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, Country: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>City:</label>
                <input
                  type="text"
                  className="form-control"
                  value={newAddress.City}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, City: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Street:</label>
                <input
                  type="text"
                  className="form-control"
                  value={newAddress.Street}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, Street: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Building Number:</label>
                <input
                  type="number"
                  className="form-control"
                  value={newAddress.BuildingNumber}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      BuildingNumber: e.target.value,
                    })
                  }
                />
              </div>
              <button
                type="button"
                className="mt-3 mx-auto d-flex"
                onClick={handleAddAddress}
                disabled={loading}
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
              >
                {loading ? "Adding..." : "Add Address"}
              </button>
            </form>
          </div>
        </div>
      )}
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
