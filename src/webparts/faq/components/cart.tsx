import React from "react";
import { useSelector } from "react-redux"; // Import useSelector
import { RootState } from "../redux/store/store"; // Adjust the path to your store file
import { useDispatch } from "react-redux";
import { RemoveFromCart } from "../redux/slices/productsSlice";
import { Link } from "react-router-dom";
const Cart: React.FC = () => {
  // Access cartItems from the Redux store
  const cartItems = useSelector((state: RootState) => state.faq.cartItems);
  interface ProductProps {
    productItems: Array<{
      Id: number;
      Title: string;
      Description: string;
      Image: string;
      Price: number;
      Category: string;
      ShowInBanner: boolean;
    }>;
  }
  const dispatch = useDispatch();
  const handleRemoveFromCart = (product: ProductProps["productItems"][0]) => {
    dispatch(RemoveFromCart(product)); // Dispatch AddToCart action
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Your Cart</h1>
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
                borderBottom: "1px solid #ddd",
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
                <p style={{ margin: 0 }}>Price: ${item.Price.toFixed(2)}</p>
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
  );
};

export default Cart;
