import * as React from "react";
import { IFaqProps } from "./IFaqProps";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addUser, fetchUserItems } from "../redux/slices/productsSlice";
import {
  TextField,
  PrimaryButton,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom"; // Importing for navigation
import "./SignUp.css";

const SignUp = (props: IFaqProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    if (props.context) {
      dispatch(fetchUserItems({ context: props.context })); // Fetch users
    }
  }, [dispatch, props.context]);

  const [newUser, setNewUser] = useState({
    Title: "",
    Email: "",
    Password: "",
    PhoneNumber: "",
    Token: "",
    ExpirationToken: "",
  });

  const [showMessage, setShowMessage] = useState(false); // State to show success message

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddUser = () => {
    const token = uuidv4();
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);

    console.log("Generated Token:", token);
    console.log("Expiration Time:", expiration);

    // Dispatch the user object with the token
    dispatch(
      addUser({
        Title: newUser.Title,
        Email: newUser.Email,
        Password: newUser.Password,
        PhoneNumber: newUser.PhoneNumber,
        Token: token,
        ExpirationToken: expiration, // Include the generated token
      })
    );

    // Show success message
    setShowMessage(true);

    // Redirect to login page after 2 seconds
    setTimeout(() => {
      navigate("/login"); // Update with your login page route
    }, 4000);

    // Reset form fields
    setNewUser({
      Title: "",
      Email: "",
      Password: "",
      PhoneNumber: "",
      Token: "",
      ExpirationToken: "",
    });
  };

  return (
    <div className="faqContainer">
      <div className="formContainer">
        <h2 style={{ textAlign: "center", fontWeight: "bold" }}>Sign Up</h2>

        {showMessage && (
          <MessageBar
            messageBarType={MessageBarType.success}
            isMultiline={false}
            dismissButtonAriaLabel="Close"
          >
            You have successfully signed up!
          </MessageBar>
        )}

        <TextField
          label="Name"
          name="Title"
          value={newUser.Title}
          onChange={handleInputChange}
          required
        />

        <TextField
          label="Email"
          name="Email"
          value={newUser.Email}
          onChange={handleInputChange}
          type="email"
          required
        />

        <TextField
          label="Password"
          name="Password"
          value={newUser.Password}
          onChange={handleInputChange}
          type="password"
          required
        />

        <TextField
          label="Phone Number"
          name="PhoneNumber"
          value={newUser.PhoneNumber}
          onChange={handleInputChange}
          required
        />

        <PrimaryButton
          onClick={handleAddUser}
          text="Sign Up"
          styles={{
            root: {
              marginTop: "20px",
              width: "100%",
              background: "linear-gradient(to right, #5F4949 0%, #713838 30%)",
              border: "0",
            },
          }}
        />
      </div>
    </div>
  );
};

export default SignUp;
