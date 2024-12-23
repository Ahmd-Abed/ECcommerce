import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Stack, Text } from "@fluentui/react";
import {
  fetchProducts,
  fetchUserCartProducts,
} from "../redux/slices/productsSlice";
import { RootState } from "../redux/store/store";
import "bootstrap/dist/css/bootstrap.min.css";
import Product from "./Product";
import Footer from "./Footer";
import MarqueeComponent from "./MarqueeComponent";
import ProductsBanner from "./ProductsBanner";
import FavoriteCategoryProducts from "./FavoriteCategoryProducts";
import * as pnp from "sp-pnp-js";
import ReviewAccordion from "./ReviewAccordion";
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = localStorage.getItem("user") || "{}";
  const user = JSON.parse(userData);
  const userGUID = user.GUID;
  // Get product items from the Redux store
  const { productItems, loadingLogin, errorLogin } = useSelector(
    (state: RootState) => state.faq
  );
  useEffect(() => {
    const fetchAndValidateUser = async () => {
      try {
        // Fetch user item from SharePoint by GUID
        const users = await pnp.sp.web.lists
          .getByTitle("User")
          .items.filter(`GUID eq '${userGUID}'`)
          .select("ExpirationToken")
          .get();

        if (users.length > 0) {
          const fetchedUser = users[0];
          const newExpirationToken = fetchedUser.ExpirationToken;

          // Update local storage with the new expiration token
          user.ExpirationToken = newExpirationToken;
          localStorage.setItem("user", JSON.stringify(user));

          const currentDate = Date.now(); // Get the current timestamp
          const expirationDate = new Date(newExpirationToken).getTime();

          // Check if the token is expired
          if (currentDate > expirationDate) {
            localStorage.removeItem("user");
            alert("Login Expire");
            navigate("/login");
          }
        } else {
          console.error("User not found in SharePoint");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user from SharePoint:", error);
        localStorage.removeItem("user");
        navigate("/login");
      }
    };
    fetchAndValidateUser();
    // Fetch product items
    dispatch(fetchProducts({ context: user.context }));
    dispatch(fetchUserCartProducts({ userGUID }));
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
        <FavoriteCategoryProducts />
        <ReviewAccordion />
      </Stack>
      <Footer />
    </>
  );
};

export default HomePage;
