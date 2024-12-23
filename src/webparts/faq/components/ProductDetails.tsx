import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../redux/store/store";
import "./ProductDetails.css";
import { addReview } from "../redux/slices/productsSlice";
import { AddToCart } from "../redux/slices/userSlice";
import CustomAlert from "./CustomAlert"; // Make sure to import CustomAlert component

interface ProductProps {
  productItems: Array<{
    Id: number;
    Title: string;
    Description: string;
    Image: string;
    Price: number;
    Category: string | { Title: string };
    ShowInBanner: boolean;
  }>;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false); // Track if review form is visible
  const [newReview, setNewReview] = useState({
    Title: "",
    Description: "",
  });
  const { productItems } = useSelector((state: RootState) => state.product);
  const dispatch = useDispatch();

  const messageRef = useRef(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log("Updating input:", name, value); // Check the input changes
    setNewReview((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddToCart = (product: ProductProps["productItems"][0]) => {
    dispatch(AddToCart(product)); // Dispatch AddToCart action
    setSuccessMessage(`${product.Title} added to cart`); // Show success message
  };

  // Find the product by ID
  const products = productItems.filter(
    (item) => item.Id === parseInt(id || "0")
  );
  const product = products[0]; // Get the first matching product

  if (!product) {
    return <div>Product not found</div>;
  }
  const handleReviewSubmit = () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.log("No user data found. Please log in.");
      setSuccessMessage("Please log in to submit a review.");
      return; // Exit the function early if no user data is found
    }

    const user = JSON.parse(userData); // Safely parse the string into an object
    const userId = user.ID;

    if (newReview.Title && newReview.Description) {
      console.log("Dispatching review:", newReview);
      dispatch(
        addReview({
          Title: newReview.Title,
          Description: newReview.Description,
          ProductId: product.Id,
          UserId: userId,
        })
      );

      setNewReview({
        Title: "",
        Description: "",
      });
      setShowReviewForm(false);
      setSuccessMessage("Thank you for your review!");
    } else {
      setSuccessMessage("Please fill out all fields.");
    }
  };

  const handleCancelReview = () => {
    // Reset the form fields and hide the form
    setNewReview({
      Title: "",
      Description: "",
    });
    setShowReviewForm(false);
  };

  return (
    <div className="product-details">
      {/* Product Details Section */}
      <div className="product-info-section">
        <div className="product-image">
          <img src={product.Image} alt={product.Title} />
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.Title}</h1>
          <p className="product-description">{product.Description}</p>
          <div className="product-price">${product.Price.toFixed(1)}</div>
          <button
            className="btn btn-primary"
            onClick={() => handleAddToCart(product)}
            style={{
              background: "linear-gradient(90deg, #5f4949 0, #713838 30%)",
              border: "none",
              width: "125px",
              height: "45px",
            }}
          >
            Add to Cart
          </button>
          <div className="product-shipping">
            Free shipping on orders over $45
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <CustomAlert
          ref={messageRef}
          message={successMessage}
          onClose={() => setSuccessMessage(null)} // Close the alert when clicked
        />
      )}
      <hr />
      {/* Review Section */}
      <div className="review-section">
        {/* Review Button */}
        <button
          className="btn btn-secondary"
          onClick={() => setShowReviewForm(!showReviewForm)} // Toggle the review form visibility
          style={{
            background: "linear-gradient(90deg, #4d4949 0, #5d4e4e 30%)",
            border: "none",
            width: "170px",
            height: "45px",
            marginTop: "15px",
          }}
        >
          Write a Review
        </button>

        {/* Review Form */}
        {showReviewForm && (
          <div
            className="review-form"
            style={{ marginTop: "20px", maxWidth: "600px" }}
          >
            {/* Review Title Input */}
            <label
              htmlFor="reviewTitle"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Review Title
            </label>
            <input
              type="text"
              id="reviewTitle"
              name="Title" // Add name attribute
              value={newReview.Title}
              onChange={handleInputChange}
              placeholder="Review Title"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                marginBottom: "10px",
              }}
            />

            {/* Comment Input */}
            <label
              htmlFor="reviewComment"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Comment
            </label>
            <textarea
              id="reviewComment"
              name="Description" // Add name attribute
              value={newReview.Description}
              onChange={handleInputChange}
              placeholder="Write your review here..."
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                marginBottom: "10px",
              }}
            />

            {/* Cancel and Submit Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={handleCancelReview}
                style={{
                  background: "linear-gradient(90deg, #e4a7a7 0, #d08e8e 30%)",
                  border: "none",
                  padding: "10px 20px",
                  color: "#fff",
                  borderRadius: "5px",
                  marginTop: "15px",
                  marginRight: "20px",
                }}
              >
                Cancel Review
              </button>
              <button
                onClick={handleReviewSubmit}
                style={{
                  background: "linear-gradient(90deg, #4c9a2a 0, #5d9f3b 30%)",
                  border: "none",
                  padding: "10px 20px",
                  color: "#fff",
                  borderRadius: "5px",
                  marginTop: "15px",
                }}
              >
                Submit Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
