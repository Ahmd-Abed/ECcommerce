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
    console.log(productItems);

    // Fetch product items
    if (user.context) {
      console.log("in Context");
      dispatch(fetchProducts({ context: user.context }));
    }
  }, [user, navigate, dispatch]);

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
        <Text variant="large" styles={{ root: { marginBottom: "10px" } }}>
          Products:
        </Text>
        {loadingLogin && <Text>Loading...</Text>}
        {errorLogin && (
          <Text styles={{ root: { color: "red" } }}>{errorLogin}</Text>
        )}
        {productItems.length > 0 ? (
          <ul>
            {productItems.map((product) => (
              <li key={product.Id}>
                <Text variant="mediumPlus">{product.Title}</Text>
                <Text variant="small">{product.Description}</Text>
              </li>
            ))}
          </ul>
        ) : (
          !loadingLogin && <Text>No products available.</Text>
        )}
      </Stack>
    </Stack>
  );
};

export default HomePage;
