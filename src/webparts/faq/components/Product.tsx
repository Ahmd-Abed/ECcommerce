import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import CategoryFilter from "./CategoryFilter";
import Search from "./SearchProduct";
import { AddToCart, fetchCategories } from "../redux/slices/productsSlice";
import CustomAlert from "./CustomAlert"; // Import the CustomAlert component
import "./CustomAlert.css";
import "./Product.css";

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

const Product: React.FC<ProductProps> = ({ productItems }) => {
  const categories = useSelector((state: RootState) => state.faq.categories);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1); // Track current page
  const productsPerPage = 5; // Number of products per page
  const messageRef = useRef<HTMLDivElement | null>(null); // Ref for success message
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCategories());
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
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

  // Filter products by both category and search term
  const filteredProducts =
    searchTerm === ""
      ? filteredProductsByCategory
      : filteredProductsByCategory.filter((product) => {
          return (
            product.Title.toLowerCase().indexOf(searchTerm.toLowerCase()) !==
              -1 ||
            product.Description.toLowerCase().indexOf(
              searchTerm.toLowerCase()
            ) !== -1
          );
        });

  // Pagination logic: Calculate the products for the current page
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle add to cart
  const handleAddToCart = (product: ProductProps["productItems"][0]) => {
    dispatch(AddToCart(product)); // Dispatch AddToCart action
    setSuccessMessage(`${product.Title} added to cart`); // Show success message
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // No pagination if there's only one page
    if (totalPages <= 1) return null;

    // Define the range of pages to show
    let pagesToShow = [];

    // Handle edge case when on first or last page
    if (currentPage === 1) {
      pagesToShow = [1, 2];
    } else if (currentPage === totalPages) {
      pagesToShow = [totalPages - 1, totalPages];
    } else {
      pagesToShow = [currentPage - 1, currentPage, currentPage + 1];
    }

    // Ensure no page numbers are out of range
    pagesToShow = pagesToShow.filter((page) => page >= 1 && page <= totalPages);

    const showPrevious = currentPage > 1;
    const showNext = currentPage < totalPages;

    return (
      <div className="pagination">
        {/* Conditionally render the "Previous" button */}
        {showPrevious && (
          <button
            className="btn btn-secondary"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
        )}

        {/* Render page numbers */}
        {pagesToShow.map((page) => (
          <button
            key={page}
            className={`btn ${
              page === currentPage ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}

        {/* Conditionally render the "Next" button */}
        {showNext && (
          <button
            className="btn btn-secondary"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        )}
      </div>
    );
  };
  return (
    <div className="container">
      {loading ? (
        <div className="spinner d-flex">
          <img
            className="m-auto"
            src="/sites/ECommerce/SiteAssets/Spinner.gif"
            alt="Loading..."
            style={{ width: "100px", height: "100px" }}
          />
        </div>
      ) : (
        <>
          <CustomAlert
            ref={messageRef}
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />

          <div className="d-flex align-items-center">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={(category) => {
                setSelectedCategory(category);
                setCurrentPage(1); // Reset to the first page when category changes
              }}
            />
            <Search
              onSearch={(searchTerm) => {
                setSearchTerm(searchTerm);
                setCurrentPage(1); // Reset to the first page when search term changes
              }}
            />
          </div>
<<<<<<< HEAD
        ) : currentProducts.length > 0 ? (
          currentProducts.map((product) => (
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
                        "linear-gradient(90deg, #5f4949 0, #713838 30%)",
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
=======
>>>>>>> ahmad

          <div className="row">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
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
                      <h5
                        className="card-title"
                        style={{ whiteSpace: "nowrap" }}
                      >
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
                            "linear-gradient(90deg, #5f4949 0, #713838 30%)",
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

          {/* Render pagination controls */}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default Product;
