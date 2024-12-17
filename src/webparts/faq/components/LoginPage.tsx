import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as pnp from "sp-pnp-js";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Stack,
  TextField,
  PrimaryButton,
  Text,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import { signIn } from "../redux/slices/productsSlice";
import { RootState } from "../redux/store/store";

const LoginPage: React.FC = () => {
  pnp.setup({
    sp: {
      baseUrl: "https://netways2023.sharepoint.com/sites/ECommerce",
    },
  });

  const [User, setUser] = useState({ Email: "", Password: "" });
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.faq);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async () => {
    try {
      await dispatch(signIn({ Email: User.Email, Password: User.Password }));
      if (user && user?.UserUID) {
        navigate("/home");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to left, #5F4949, #674343, #713838)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          overflow: "hidden",
          width: "900px",
          backgroundColor: "#fff",
        }}
      >
        {/* Left Side: Image */}
        <div
          style={{
            backgroundImage: `url('/sites/ECommerce/SiteAssets/coffee-brain-caffeine-neuroscincces.webp')`, // Update with the actual image path
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Right Side: Form */}
        <Stack
          tokens={{ childrenGap: 15 }}
          styles={{
            root: {
              padding: "40px",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            },
          }}
        >
          <Text
            variant="xLarge"
            styles={{ root: { textAlign: "center", color: "#713838" } }}
          >
            Login
          </Text>
          <Text
            styles={{
              root: {
                textAlign: "center",
                marginBottom: "20px",
                color: "#555",
              },
            }}
          >
            Welcome to our coffee shop! Please log in to continue.
          </Text>
          {error && (
            <MessageBar
              messageBarType={MessageBarType.error}
              isMultiline={false}
            >
              {error}
            </MessageBar>
          )}
          <TextField
            placeholder="Enter your email"
            name="Email"
            value={User.Email}
            onChange={handleInputChange}
            required
          />
          <TextField
            placeholder="Enter your password"
            type="password"
            name="Password"
            value={User.Password}
            onChange={handleInputChange}
            canRevealPassword
            required
          />
          <PrimaryButton
            text={true ? "Logging in..." : "Log In"}
            onClick={handleLoginSubmit}
            styles={{
              root: {
                width: "100%",
                background:
                  "linear-gradient(to right, #5F4949 0%, #713838 30%)",
                border: "none",
                height: "40px",
                fontSize: "16px",
              },
              rootHovered: {
                backgroundColor: "rgba(113, 56, 56, 0.8)",
                border: "none",
              },
              rootPressed: {
                backgroundColor: "#713838",
                border: "none",
              },
            }}
            disabled={false}
          />
          <Text
            styles={{
              root: {
                textAlign: "center",
                marginTop: "15px",
                color: "#888",
              },
            }}
          >
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#713838" }}>
              Sign Up
            </Link>
          </Text>
        </Stack>
      </div>
    </div>
  );
};

export default LoginPage;
