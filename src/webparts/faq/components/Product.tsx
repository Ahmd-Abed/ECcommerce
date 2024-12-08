import React, { useState } from "react";
import CategoryFilter from "./CategoryFilter";
import Search from "./SearchProduct";

interface ProductProps {
  productItems: Array<{
    Id: number;
    Title: string;
    Description: string;
    Image: string;
    Price: number;
    Category: string;
  }>;
}

const Product: React.FC<ProductProps> = ({ productItems }) => {
  // const [filteredProducts, setFilteredProducts] = useState(productItems);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const categories = ["All", "Desserts", "Coffee", "Tea"];

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
      ? filteredProductsByCategory // If searchTerm is empty, return only filtered by category
      : filteredProductsByCategory.filter((product) => {
          return (
            product.Title.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
          );
        });

  return (
    <div
      className="container"
      style={{
        marginTop: "800px",
      }}
    >
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <Search onSearch={handleSearch} />
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
                    <strong>Price:</strong> ${product.Price.toFixed(2)}
                  </p>
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
