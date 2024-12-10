import React from "react";
import { DefaultButton } from "@fluentui/react"; // Optional, for styling
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

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
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img
            src={logoUrl}
            alt="Logo"
            style={{ width: "75px" }}
            className="d-inline-block align-top"
          />
        </a>
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
              <DefaultButton text="Logout" onClick={handleLogout} />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
