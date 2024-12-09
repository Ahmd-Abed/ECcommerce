import React from "react";

interface ProductProps {
  product: {
    Id: number;
    Title: string;
    Description: string;
    Image: string;
    Price: number;
  };
}

const Product: React.FC<ProductProps> = ({ product }) => {
  return (
    <div
      className="card mb-3"
      style={{
        maxWidth: "300px",
        margin: "10px",
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
      <div
        className="card-body"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <h5
          className="card-title text-truncate"
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
            height: "4.5em", // Adjust based on line height
          }}
        >
          {product.Description}
        </p>
        <p className="card-text">
          <strong>Price:</strong> ${product.Price.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default Product;
