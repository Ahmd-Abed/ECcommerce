import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/slices/productsSlice";
import { RootState } from "../redux/store/store";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const ProductsBanner: React.FC = () => {
  const { productItems, loadingLogin, errorLogin } = useSelector(
    (state: RootState) => state.faq
  );
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Fetch Product items
    dispatch(fetchProducts({ context: user.context }));
  }, [dispatch, user.context]);

  if (loadingLogin) {
    return <div>Loading...</div>;
  }
  if (errorLogin) {
    return <div>Error loading products carousel: {errorLogin}</div>;
  }
  // Filter products to include only those with ShowInBanner set to true
  const bannerProducts = productItems.filter(
    (product: any) => product.ShowInBanner
  );

  if (!bannerProducts || bannerProducts.length === 0) {
    return null; // Hide the carousel if there are no products
  }

  return (
    <div
      id="productCarousel"
      className="carousel slide h-100"
      data-bs-ride="carousel"
      style={{ padding: "0" }}
    >
      <div className="carousel-inner h-100">
        {bannerProducts.map((product: any, index: number) => (
          <div
            className={`carousel-item h-100 ${index === 0 ? "active" : ""}`}
            key={product.Id}
          >
            <div className="text-center h-100">
              <img
                src={product.Image}
                alt={product.ShowInBanner}
                className="d-block w-100 h-100"
                style={{ objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "0%",
                  left: "0%",
                  //   transform: "translate(-50%, -50%)",
                  color: "white",
                  //   backgroundColor: "rgba(0, 0, 0, 0.5)",
                  background:
                    "linear-gradient(to right, rgba(95, 73, 73, 0.4) 0%, rgba(113, 56, 56, 0.4) 30%)",
                  padding: "50px",
                  borderRadius: "5px",
                  width: "100%",
                  height: "100%",
                }}
              >
                <h3>{product.Title}</h3>
                <p>{product.Description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#productCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#productCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default ProductsBanner;
