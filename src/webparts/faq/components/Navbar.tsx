import React from "react";
import { DefaultButton } from "@fluentui/react"; // Optional, for styling
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Faq.module.scss";

interface NavComponentProps {
  logoUrl: string; // URL for the logo
}

const Navbar: React.FC<NavComponentProps> = ({ logoUrl }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark shadow-sm ${styles["navbar-custom"]}`}
    >
      <div className="container-fluid">
        <Link className="navbar-brand" to="/home">
          <img
            src={logoUrl}
            alt="Logo"
            style={{ width: "75px", padding: "10px" }}
            className="d-inline-block align-top"
          />
        </Link>

        <div className="navbar-nav d-flex ms-4">
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
            <li className="nav-item">
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

// Link styling for "About" and "Contact Us"
const linkStyle = {
  fontSize: "1.1rem",
  fontWeight: "500",
  padding: "8px 12px",
  borderRadius: "5px",
  transition: "background-color 0.3s ease, color 0.3s ease",
};

export default Navbar;
