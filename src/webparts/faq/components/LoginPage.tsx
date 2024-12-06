import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as pnp from "sp-pnp-js";
import { useNavigate } from "react-router-dom";
import {
  Stack,
  TextField,
  PrimaryButton,
  Text,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import { signIn } from "../redux/slices/productsSlice";

const LoginPage: React.FC = () => {
  pnp.setup({
    sp: {
      baseUrl: "https://netways2023.sharepoint.com/sites/ECommerce",
    },
  });
  const [User, setUser] = useState({
    Email: "",
    Password: "",
  });

  const [error] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async () => {
    dispatch(signIn({ Email: User.Email, Password: User.Password }));
    navigate("/home");
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
      tokens={{ childrenGap: 15 }}
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
          Login
        </Text>
        {error && (
          <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
            {error}
          </MessageBar>
        )}
        <TextField
          label="Email"
          type="email"
          name="Email"
          value={User.Email}
          onChange={handleInputChange}
          required
        />
        <TextField
          label="Password"
          type="password"
          name="Password"
          value={User.Password}
          onChange={handleInputChange}
          canRevealPassword
          required
        />
        <PrimaryButton
          text="Login"
          onClick={handleLoginSubmit}
          styles={{
            root: {
              width: "100%",
              backgroundColor: "rgba(3, 120, 124, .8)",
              border: "0",
            },
          }}
        />
        <Text>
          If you don't have an account,please{" "}
          <Link
            to="/signup"
            style={{
              color: "#0078d4",
            }}
          >
            Sign Up.
          </Link>
        </Text>
      </Stack>
    </Stack>
  );
};

export default LoginPage;
