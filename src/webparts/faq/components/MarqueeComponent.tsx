import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./MarqueeComponent.css";
import { fetchAnnouncements } from "../redux/slices/productsSlice";
import { RootState } from "../redux/store/store";
const MarqueeComponent: React.FC = () => {
  const { announcementItems, loadingLogin, errorLogin } = useSelector(
    (state: RootState) => state.faq
  );
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  useEffect(() => {
    // Fetch Announcments items
    dispatch(fetchAnnouncements({ context: user.context }));
  }, []);
  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "10px 0",
        overflow: "hidden",
        position: "relative",
        display: announcementItems.length > 0 ? "block" : "none",
      }}
    >
      {loadingLogin && <p>Loading...</p>}
      {errorLogin && <p>{errorLogin}</p>}
      <div className="marquee-text">
        {announcementItems.length > 0
          ? announcementItems.map((announcement, index) => (
              <span key={index}>
                ☕&nbsp;{announcement.Description} &nbsp;🎉|&nbsp;&nbsp;|
              </span>
            ))
          : null}
        {/* Special Offer: Buy 1 Get 1 Free on Cappuccinos!
        &nbsp;&nbsp;|&nbsp;&nbsp; 🍩 Free Donut with Every Latte Purchase! 🍩
        &nbsp;&nbsp;|&nbsp;&nbsp; 🎉 20% Off on All Cold Brews This Week! 🎉 */}
      </div>
    </div>
  );
};

export default MarqueeComponent;
