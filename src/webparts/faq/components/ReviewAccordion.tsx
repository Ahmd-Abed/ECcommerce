import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { fetchReviews } from "../redux/slices/productsSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import "./ReviewAccordion.css";
import { Link } from "react-router-dom";

interface ReviewProps {
  ProductId?: number;
}
const ReviewAccordion: React.FC<ReviewProps> = ({ ProductId }) => {
  const reviewItems = useSelector(
    (state: RootState) => state.product.reviewItems
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchReviews());
  }, []);

  // Filter reviews by productId if provided
  const filteredReviews = ProductId
    ? reviewItems.filter((review) => review.ProductId === ProductId)
    : reviewItems;

  return (
    <div className="container mt-4">
      <h2>Reviews</h2>
      {filteredReviews.length === 0 ? (
        <p>No reviews available.</p>
      ) : (
        <div className="accordion" id="reviewAccordion">
          {filteredReviews.map((review, index) => (
            <div key={review.Id} className="accordion-item">
              <h2 className="accordion-header" id={`heading${review.Id}`}>
                <button
                  className={`accordion-button ${
                    index !== 0 ? "collapsed" : ""
                  }`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${review.Id}`}
                  aria-expanded={index === 0 ? "true" : "false"}
                  aria-controls={`collapse${review.Id}`}
                >
                  {review.Title}
                </button>
              </h2>
              <div
                id={`collapse${review.Id}`}
                className={`accordion-collapse collapse ${
                  index === 0 ? "show" : ""
                }`}
                aria-labelledby={`heading${review.Id}`}
                data-bs-parent="#reviewAccordion"
              >
                <div className="accordion-body">
                  <p>
                    <strong>Product Name:</strong>{" "}
                    <Link
                      to={`/ProductDetails/${review.ProductId}`}
                      className="custom-link"
                    >
                      {review.Product}
                    </Link>
                  </p>
                  <p>
                    <strong>By:</strong> {review.User}
                  </p>
                  <p>{review.Description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewAccordion;
