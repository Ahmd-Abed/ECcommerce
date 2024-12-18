import React from "react";
import { DefaultButton } from "@fluentui/react"; // Optional, for styling
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Faq.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store/store";
<<<<<<< HEAD
import { Logout } from "../redux/slices/productsSlice";
interface NavComponentProps {
  logoUrl: string; // URL for the logo
}

const Navbar: React.FC<NavComponentProps> = ({ logoUrl }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.faq.cartItems);
=======

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.faq.userCarts);
>>>>>>> ahmad
  const handleLogout = () => {
    dispatch(Logout());
    localStorage.removeItem("user");
    navigate("/login");
  };

  // useEffect(() => {
  //   console.log("Cart items have changed:", cartItems);
  // }, []);

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark shadow-sm ${styles["navbar-custom"]}`}
    >
      <div className="container-fluid">
        <Link className="navbar-brand" to="/home">
          <img
            src="/sites/ECommerce/SiteAssets/CupCoffe.png"
            alt="Logo"
            style={{ width: "75px", padding: "10px" }}
            className="d-inline-block align-top"
          />
        </Link>

        <div className="navbar-nav d-flex ms-4">
          <Link
            className="nav-link text-white mx-2"
            to="/home"
            style={linkStyle}
          >
            Home
          </Link>
          <Link
            className="nav-link text-white mx-2"
            to="/about"
            style={linkStyle}
          >
            About
          </Link>
          <Link
            className="nav-link text-white mx-2"
            to="/contactus"
            style={linkStyle}
          >
            Contact Us
          </Link>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item d-flex align-items-center">
              <Link to="/cart">
                <span className={styles.cartCount}>{cartItems.length}</span>
                <img
                  src="/sites/ECommerce/SiteAssets/card.png"
                  alt="Card Icon"
                  style={{
                    width: "45px",
                    marginRight: "8px",
                    cursor: "pointer",
                  }}
                />
              </Link>

              <DefaultButton
                text="Logout"
                onClick={handleLogout}
                className={styles.logoutButtonStyle}
                styles={{
                  root: { fontWeight: 700 },
                  label: { fontWeight: 700 },
                }}
              />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

const linkStyle = {
  fontSize: "1.1rem",
  fontWeight: "500",
  padding: "8px 12px",
  borderRadius: "5px",
  transition: "background-color 0.3s ease, color 0.3s ease",
};

export default Navbar;
