import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store/store";
import { addOrder } from "../redux/slices/productsSlice";
import {
  RemoveFromCart,
  clearCart,
  clearUserCart,
} from "../redux/slices/userSlice";
import { Link } from "react-router-dom";
import CustomAlert from "./CustomAlert"; // Import the CustomAlert component
import "./CustomAlert.css";

const Cart: React.FC = () => {
  interface ProductProps {
    productItems: Array<{
      Id: number;
      Title: string;
      Description: string;
      Image: string;
      Price: number;
      Category: string | { Title: string };
      ShowInBanner: boolean;
    }>;
  }

  const cartItems = useSelector((state: RootState) => state.user.userCarts);
  const dispatch = useDispatch();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const messageRef = useRef<HTMLDivElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // const totalPrice = cartItems.reduce((sum, item) => sum + item.Price, 0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCheckOut, setLoadingCheckOut] = useState<boolean>(false);
  // Local state for quantities
  const [quantities, setQuantities] = useState<{ [id: number]: number }>({});

  // Initialize quantities for all cart items
  useEffect(() => {
    const initialQuantities = cartItems.reduce((acc, item) => {
      acc[item.Id] = 1; // Default quantity is 1
      return acc;
    }, {} as { [id: number]: number });
    setQuantities(initialQuantities);
  }, [cartItems]);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.Price * (quantities[item.Id] || 1),
    0
  );

  const handleIncrement = (id: number) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  };

  const handleDecrement = (id: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 1) - 1, 1), // Minimum quantity is 1
    }));
  };

  const handleRemoveFromCart = (product: ProductProps["productItems"][0]) => {
    dispatch(RemoveFromCart(product));
    setSuccessMessage(`${product.Title} removed from your cart`);
  };

  const confirmCheckout = async () => {
    setLoadingCheckOut(true);
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        setErrorMessage("No user data found. Please log in.");
        return;
      }
      const user = JSON.parse(userData);
      const userId = user.ID;
      const userGUID = user.GUID;
      if (!userId) {
        setErrorMessage("User is not logged in. Please log in to continue.");
        return;
      }

      const productIds = cartItems.map((item) => item.Id);

      // Format the product quantities as a string
      const productsQuantities = cartItems
        .map((item) => `${item.Title}[${quantities[item.Id] || 1}]`)
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
      setQuantities({});
    } catch (error) {
      setErrorMessage("Failed to place the order. Please try again.");
    } finally {
      setLoadingCheckOut(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (successMessage && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [successMessage]);

  return (
    <>
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
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "#eadcdc",
            height: "100vh",
          }}
        >
          <h1>Your Cart</h1>
          <CustomAlert
            ref={messageRef}
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
          {errorMessage && (
            <CustomAlert
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
            />
          )}
          {cartItems.length > 0 ? (
            <div
              className="cart-container"
              style={{ maxWidth: "800px", margin: "0 auto" }}
            >
              {cartItems.map((item) => (
                <div
                  key={item.Id}
                  className="cart-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                    borderBottom: "1px solid #7138383b",
                  }}
                >
                  <img
                    src={item.Image}
                    alt={item.Title}
                    style={{
                      height: "100px",
                      width: "150px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                  <div style={{ flex: 1, paddingLeft: "10px" }}>
                    <h5 style={{ margin: "0 0 5px", fontWeight: "bold" }}>
                      {item.Title}
                    </h5>
                    <p style={{ margin: 0 }}>
                      Price: $
                      {(item.Price * (quantities[item.Id] || 1)).toFixed(2)}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <button
                        onClick={() => handleDecrement(item.Id)}
                        style={{
                          border: "none",
                          borderRadius: "5px",
                        }}
                      >
                        -
                      </button>
                      <span>{quantities[item.Id] || 1}</span>
                      <button
                        onClick={() => handleIncrement(item.Id)}
                        style={{
                          border: "none",
                          borderRadius: "5px",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    style={{
                      backgroundColor: "red",
                      color: "#fff",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                      borderRadius: "5px",
                      background:
                        "linear-gradient(to right, #5a4e4e 10%, #ea4c4c 60%)",
                    }}
                    onClick={() => handleRemoveFromCart(item)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <h1
                  style={{
                    marginBottom: "5px",
                    fontSize: "24px",
                    color: "#5f4949",
                  }}
                >
                  Total Price: <b>{totalPrice}$</b>
                </h1>
                <button
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
                  onClick={confirmCheckout}
                >
                  Checkout
                  {loadingCheckOut && (
                    <img
                      src="/sites/ECommerce/SiteAssets/small-spinerr.gif"
                      style={{ marginLeft: "8px" }}
                    />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>Your cart is empty!</p>
              <Link
                to="/home"
                style={{
                  textDecoration: "none",
                  color: "#713838",
                  fontWeight: "bold",
                }}
              >
                Go Shopping🛒
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Cart;
