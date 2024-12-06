import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, Stack, Text } from "@fluentui/react";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

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
  }, [user, navigate]);

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
          backgroundColor: "#f3f2f1",
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
    </Stack>
  );
};

export default HomePage;
