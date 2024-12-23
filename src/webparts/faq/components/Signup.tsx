import * as React from "react";
import { IFaqProps } from "./IFaqProps";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser, fetchUserItems } from "../redux/slices/userSlice";
import { RootState } from "../redux/store/store";
import {
  TextField,
  PrimaryButton,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import { useNavigate } from "react-router-dom"; // Importing for navigation
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Firebase imports
import "./SignUp.css";

const SignUp = (props: IFaqProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation
  const { loadingLogin } = useSelector((state: RootState) => state.user);
  useEffect(() => {
    if (props.context) {
      dispatch(fetchUserItems({ context: props.context }));
    }
  }, [dispatch, props.context]);

  const [newUser, setNewUser] = useState({
    Title: "",
    Email: "",
    Password: "",
    PhoneNumber: "",
    ExpirationToken: "",
    UserUID: "",
  });

  const [showMessage, setShowMessage] = useState(false); // State to show success message
  const [error, setError] = useState<string | null>(null); // Error state for handling Firebase errors

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleSignUp = async () => {
    const auth = getAuth(); // Initialize Firebase Auth

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.Email,
        newUser.Password
      );

      const userUID = userCredential.user.uid; // Get User UID from Firebase
      console.log("User UID:", userUID);

      const expiration = new Date();
      expiration.setHours(expiration.getHours() + 24);

      // Dispatch the user data, including the UserUID, to the Redux store
      dispatch(
        addUser({
          Title: newUser.Title,
          Email: newUser.Email,
          Password: newUser.Password, // Optional: store password only if encrypted
          PhoneNumber: newUser.PhoneNumber,
          ExpirationToken: expiration, // Convert to string for easy storage
          UserUID: userUID, // Include the User UID from Firebase
        })
      );

      // Show success message
      setShowMessage(true);

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/login"); // Update with your login page route
      }, 4000);

      // Reset form fields
      setNewUser({
        Title: "",
        Email: "",
        Password: "",
        PhoneNumber: "",
        ExpirationToken: "",
        UserUID: "",
      });
    } catch (error: any) {
      console.error("Error signing up user:", error.message);
      setError(error.message); // Display error if Firebase sign-up fails
    }
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

        {error && (
          <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={false}
            dismissButtonAriaLabel="Close"
          >
            {error}
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
          onClick={handleSignUp}
          styles={{
            root: {
              width: "100%",
              background: loadingLogin
                ? "linear-gradient(to right, #fff9f8 0%, #ac7d7d 30%)"
                : "linear-gradient(to right, #5F4949 0%, #713838 30%)",
              color: loadingLogin ? "rgba(113, 56, 56, 0.8)" : "#fff",
              border: "none",
              height: "40px",
              fontSize: "16px",
            },
            rootHovered: {
              backgroundColor: loadingLogin ? "#fff" : "rgba(113, 56, 56, 0.8)",
              border: "none",
            },
            rootPressed: {
              backgroundColor: "#713838",
              border: "none",
            },
          }}
          disabled={loadingLogin}
        >
          {loadingLogin ? (
            <>
              Signing up{" "}
              <img
                src="/sites/ECommerce/SiteAssets/small-spinerr.gif"
                style={{
                  marginLeft: "8px",
                }}
              />
            </>
          ) : (
            "Sign up"
          )}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default SignUp;
