import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Faq.module.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
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

        {/* Contact Information */}
        <p className="mb-2">
          <strong>Email:</strong> coffeebox@gmail.com
        </p>
        <p className="mb-4">
          <strong>Phone:</strong> +961 70 000 111
        </p>

        {/* Social Media Icons */}
        <div className="d-flex justify-content-center gap-3 mb-4">
          <a
            href="https://www.instagram.com"
            className="text-white"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <i className="bi bi-instagram fs-4"></i>
          </a>
          <a
            href="https://www.facebook.com"
            className="text-white"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <i className="bi bi-facebook fs-4"></i>
          </a>
          <a
            href="https://x.com"
            className="text-white"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
          >
            <i className="bi bi-twitter fs-4"></i>
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
