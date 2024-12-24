import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Stack, Text } from "@fluentui/react";
import { fetchProducts } from "../redux/slices/productsSlice";
import { fetchUserCartProducts } from "../redux/slices/userSlice";
import { RootState } from "../redux/store/store";
import "bootstrap/dist/css/bootstrap.min.css";
import Product from "./Product";
import MarqueeComponent from "./MarqueeComponent";
import ProductsBanner from "./ProductsBanner";
import FavoriteCategoryProducts from "./FavoriteCategoryProducts";
import * as pnp from "sp-pnp-js";
import ReviewAccordion from "./ReviewAccordion";
const HomePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = localStorage.getItem("user") || "{}";
  const user = JSON.parse(userData);
  const userGUID = user.GUID;
  // Get product items from the Redux store
  const { productItems, error } = useSelector(
    (state: RootState) => state.product
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
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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
            {loading && <Text>Loading...</Text>}
            {error && <Text styles={{ root: { color: "red" } }}>{error}</Text>}

            {productItems.length > 0 ? (
              <Product productItems={productItems} />
            ) : (
              !loading && <p>No products available now.</p>
            )}
          </Stack>
          <FavoriteCategoryProducts />
          <ReviewAccordion />
        </Stack>
      )}
    </>
  );
};

export default HomePage;
