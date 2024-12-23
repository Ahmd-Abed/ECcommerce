import React, { useEffect } from "react";

interface CustomAlertProps {
  message: string | null;
  onClose: () => void;
}

const CustomAlert = React.forwardRef<HTMLDivElement, CustomAlertProps>(
  ({ message, onClose }, ref) => {
    useEffect(() => {
      if (message) {
        const timer = setTimeout(() => {
          onClose(); // Hide message after 3 seconds
        }, 3000);
        return () => clearTimeout(timer); // Cleanup timeout when component is unmounted
      }
    }, [message, onClose]);

    if (!message) return null;

    return (
      <div
        ref={ref} // Attach the ref to this div
        className="success-message"
      >
        <img
          src="/sites/ECommerce/SiteAssets/check-mark.png"
          alt="Success"
          style={{ width: "20px", height: "20px", marginRight: "10px" }}
        />
        {message}
      </div>
    );
  }
);

export default CustomAlert;
