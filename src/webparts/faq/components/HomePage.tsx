// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { PrimaryButton, Stack, Text } from "@fluentui/react";
// import { fetchProducts } from "../redux/slices/productsSlice";
// const HomePage: React.FC = () => {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user") || "{}");

//   useEffect(() => {
//     const currentDate = Date.now(); // Get the current timestamp
//     const expirationToken = user?.ExpirationToken
//       ? new Date(user.ExpirationToken).getTime()
//       : 0; // Get expiration date in milliseconds

//     // If the token has expired, redirect to login page
//     if (expirationToken && currentDate > expirationToken) {
//       localStorage.removeItem("user");
//       navigate("/login");
//     }
//   }, [user, navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   return (
//     <Stack
//       horizontalAlign="center"
//       verticalAlign="center"
//       verticalFill
//       styles={{
//         root: {
//           height: "100vh",
//           backgroundColor: "#f3f2f2",
//           padding: "20px",
//         },
//       }}
//     >
//       <Stack
//         tokens={{ childrenGap: 15 }}
//         styles={{
//           root: {
//             width: "300px",
//             padding: "20px",
//             boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
//             borderRadius: "5px",
//             backgroundColor: "#ffffff",
//           },
//         }}
//       >
//         <Text variant="xLarge" styles={{ root: { textAlign: "center" } }}>
//           Welcome, {user.Title || "User"}!
//         </Text>
//         <PrimaryButton text="Logout" onClick={handleLogout} />
//       </Stack>
//     </Stack>
//   );
// };

// export default HomePage;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PrimaryButton, Stack, Text } from "@fluentui/react";
import { fetchProducts } from "../redux/slices/productsSlice";
import { RootState } from "../redux/store/store";
import "bootstrap/dist/css/bootstrap.min.css";
import Product from "./Product";
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Stack
      horizontalAlign="center"
      verticalAlign="center"
      verticalFill
      styles={{
        root: {
          height: "100vh",
          backgroundColor: "#f3f2f2",
          padding: "20px",
        },
      }}
    >
      <Stack
        tokens={{ childrenGap: 15 }}
        styles={{
          root: {
            width: "300px",
            padding: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            borderRadius: "5px",
            backgroundColor: "#ffffff",
          },
        }}
      >
        <Text variant="xLarge" styles={{ root: { textAlign: "center" } }}>
          Welcome, {user.Title || "User"}!
        </Text>
        <PrimaryButton text="Logout" onClick={handleLogout} />
      </Stack>
      <Stack styles={{ root: { marginTop: "20px", width: "80%" } }}>
        {loadingLogin && <Text>Loading...</Text>}
        {errorLogin && (
          <Text styles={{ root: { color: "red" } }}>{errorLogin}</Text>
        )}
        {/* {productItems.length > 0 ? (
          <ul>
            {productItems.map((product) => (
              <li key={product.Id}>
                <Text variant="mediumPlus">{product.Title}</Text>
                <Text variant="small">{product.Description}</Text>
              </li>
            ))}
          </ul>
        ) : (
          !loadingLogin && <Text>No products available now.</Text>
        )} */}
        {productItems.length > 0 ? (
          <Product productItems={productItems} />
        ) : (
          !loadingLogin && <p>No products available now.</p>
        )}
      </Stack>
    </Stack>
  );
};

export default HomePage;
