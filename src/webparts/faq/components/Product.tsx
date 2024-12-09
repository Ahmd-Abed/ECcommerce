import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import CategoryFilter from "./CategoryFilter";
import Search from "./SearchProduct";
import * as pnp from "sp-pnp-js";
import { AddToCart } from "../redux/slices/productsSlice";
import CustomAlert from "./CustomAlert"; // Import the CustomAlert component
import "./CustomAlert.css";
interface ProductProps {
  productItems: Array<{
    Id: number;
    Title: string;
    Description: string;
    Image: string;
    Price: number;
    Category: string;
    ShowInBanner: boolean;
  }>;
}

const Product: React.FC<ProductProps> = ({ productItems }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const messageRef = useRef<HTMLDivElement | null>(null); // Ref for success message
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const field = await pnp.sp.web.lists
          .getByTitle("Product")
          .fields.getByTitle("Category")
          .get();
        console.log(
          "Categories Choice fetched from SharePoint:",
          field.Choices
        );
        const choices = field.Choices as string[];
        setCategories(["All", ...choices]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);
  // Scroll to success message when it updates
  useEffect(() => {
    if (successMessage && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [successMessage]);

  // Apply category filter
  const filteredProductsByCategory =
    selectedCategory === "All"
      ? productItems
      : productItems.filter((product) => product.Category === selectedCategory);

  // Handle search input change
  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  // Filter products by both category and search term
  const filtered =
    searchTerm === ""
      ? filteredProductsByCategory
      : filteredProductsByCategory.filter((product) => {
          return (
            product.Title.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
          );
        });

  const handleAddToCart = (product: ProductProps["productItems"][0]) => {
    dispatch(AddToCart(product)); // Dispatch AddToCart action
    setSuccessMessage(`${product.Title} added to cart`); // Show success message
  };

  return (
    <div className="container">
      {/* Display the success message using CustomAlert */}
      <CustomAlert
        ref={messageRef}
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />

      <div className="d-flex align-items-center">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <Search onSearch={handleSearch} />
      </div>
      <div className="row">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <div key={product.Id} className="col-md-4 col-sm-6 mb-4">
              <div
                className="card h-100"
                style={{
                  maxWidth: "300px",
                  margin: "auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <img
                  src={product.Image}
                  className="card-img-top"
                  alt={product.Title}
                  style={{ height: "150px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title" style={{ whiteSpace: "nowrap" }}>
                    {product.Title}
                  </h5>
                  <p
                    className="card-text"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      height: "4.5em",
                    }}
                  >
                    {product.Description}
                  </p>
                  <p className="card-text">
                    <strong>Price:</strong> ${product.Price.toFixed(1)}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddToCart(product)}
                    style={{
                      background:
                        " linear-gradient(90deg, #5f4949 0, #713838 30%)",
                      border: "none",
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No products match your filters</p>
        )}
      </div>
    </div>
  );
};

export default Product;
