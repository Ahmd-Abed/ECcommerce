import * as React from "react";
import { IFaqProps } from "./IFaqProps";
import { useEffect, useState } from "react";
import styles from "./Faq.module.scss"; // Importing the CSS module
import { useDispatch } from "react-redux";
import { addUser, fetchUserItems } from "../redux/slices/productsSlice";
import { TextField, PrimaryButton } from "@fluentui/react"; // Fluent UI Components
import { v4 as uuidv4 } from "uuid";
// import jwt from "jsonwebtoken";
// const SECRET_KEY ="e433b2b611673ec01dc0965b6084774c8e336a892606a55064db6ec182d0f2206ecaea3ce6fc615a595a47ba81ece08585b6ea7b2456027724a9c29429903eb6";

const SignUp = (props: IFaqProps) => {
  const dispatch = useDispatch();

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

    // const token = jwt.sign(
    //   {
    //     Email: newUser.Email,
    //     Title: newUser.Title,
    //   },
    //   SECRET_KEY,
    //   { expiresIn: "24h" }
    // );

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
    <div className={styles.faqContainer}>
      <div>
        <h2 style={{ textAlign: "center" }}>Sign Up test</h2>
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
              backgroundColor: "rgba(3, 120, 124, .8)",
              border: "0",
            },
          }}
        />
      </div>
    </div>
  );
};

export default SignUp;
