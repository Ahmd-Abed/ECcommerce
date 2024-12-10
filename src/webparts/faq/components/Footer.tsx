import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Faq.module.scss";
const Footer: React.FC = () => {
  return (
    <footer className={`text-white pt-4 pb-3 ${styles["footer"]}`}>
      <div className="container text-center">
        {/* Coffee Shop Description */}
        <p className="mb-4">
          Welcome to <strong>CoffeeBox</strong> – where every cup tells a story.
          Enjoy the finest brews crafted with love and passion for coffee
          enthusiasts.
        </p>

        {/* Social Media Icons */}
        <div className="mb-4">
          <a
            href="https://www.instagram.com"
            className="text-white me-3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <i className="bi bi-instagram fs-4"></i>
          </a>
          <a
            href="https://www.facebook.com"
            className="text-white me-3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <i className="bi bi-facebook fs-4"></i>
          </a>
          <a
            href="https://wa.me/yourwhatsapplink"
            className="text-white"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <i className="bi bi-whatsapp fs-4"></i>
          </a>
        </div>

        {/* Copyright */}
        <p className="mb-0">
          &copy; {new Date().getFullYear()} <strong>CoffeeBox</strong>. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
