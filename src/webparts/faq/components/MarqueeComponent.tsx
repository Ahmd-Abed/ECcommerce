import React from "react";
import "./MarqueeComponent.css";

const MarqueeComponent: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "10px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div className="marquee-text">
        ☕ Special Offer: Buy 1 Get 1 Free on Cappuccinos! ☕
        &nbsp;&nbsp;|&nbsp;&nbsp; 🍩 Free Donut with Every Latte Purchase! 🍩
        &nbsp;&nbsp;|&nbsp;&nbsp; 🎉 20% Off on All Cold Brews This Week! 🎉
      </div>
    </div>
  );
};

export default MarqueeComponent;
