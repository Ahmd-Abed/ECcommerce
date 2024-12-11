import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Stack, Text } from "@fluentui/react";
import { fetchProducts } from "../redux/slices/productsSlice";
import { RootState } from "../redux/store/store";
import "bootstrap/dist/css/bootstrap.min.css";
import Product from "./Product";
import Footer from "./Footer";
import MarqueeComponent from "./MarqueeComponent";
import ProductsBanner from "./ProductsBanner";
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Get product items from the Redux store
  const { productItems, loadingLogin, errorLogin } = useSelector(
    (state: RootState) => state.faq
  );
  useEffect(() => {
    const currentDate = Date.now(); // Get the current timestamp
    const expirationToken = user?.ExpirationToken
      ? new Date(user.ExpirationToken).getTime()
      : 0; // Get expiration date in milliseconds

    // If the token has expired, redirect to login page
    if (expirationToken && currentDate > expirationToken) {
      localStorage.removeItem("user");
      navigate("/login");
    }
    console.log("Product items from store:" + productItems);

    // Fetch product items

    console.log("Before fetch Products");
    dispatch(fetchProducts({ context: user.context }));
    console.log("After fetch Products");
  }, []);

  return (
    <>
      <Stack
        horizontalAlign="center"
        verticalAlign="center"
        verticalFill
        styles={{
          root: {
            backgroundColor: "#f3f2f2",
            padding: "20px",
          },
        }}
      >
        <div className="w-100">
          <MarqueeComponent />
        </div>
        <div
          className="w-100 my-4"
          style={{
            height: "320px",
          }}
        >
          <ProductsBanner />
        </div>
        <Stack styles={{ root: { marginTop: "20px", width: "100%" } }}>
          {loadingLogin && <Text>Loading...</Text>}
          {errorLogin && (
            <Text styles={{ root: { color: "red" } }}>{errorLogin}</Text>
          )}

          {productItems.length > 0 ? (
            <Product productItems={productItems} />
          ) : (
            !loadingLogin && <p>No products available now.</p>
          )}
        </Stack>
      </Stack>
      <Footer />
    </>
  );
};

export default HomePage;
