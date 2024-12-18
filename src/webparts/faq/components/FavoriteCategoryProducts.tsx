import React, { useEffect, useState } from "react";
import { IProduct } from "../../../IProducts"; // Adjust this based on your model
import { useSelector } from "react-redux";
import { RootState } from "../redux/store/store";

const FavoriteCategoryProducts: React.FC = () => {
  const categories = useSelector((state: RootState) => state.faq.categories);
  const { productItems } = useSelector((state: RootState) => state.faq);
  const [favoriteProducts, setFavoriteProducts] = useState<IProduct[]>([]); // To store filtered products

  useEffect(() => {
    if (categories.length > 0) {
      // Filter favorite categories
      const favoriteCategories = categories.filter(
        (category) => category.isFavorite === true
      );

      console.log("Favorite Categories:", favoriteCategories);

      const favoriteCategory = favoriteCategories[0];
      if (favoriteCategory) {
        // Filter products belonging to the favorite category
        const favoriteProduct = productItems.filter(
          (product) => product.Category === favoriteCategory.Title // Use category title for comparison
        );

        console.log("Favorite Products:", favoriteProduct);
        setFavoriteProducts(favoriteProduct);
      }
    }
  }, [categories, productItems]); // Run when categories or productItems change

  return (
    <div className="container">
      <h2>Favorite Categories</h2>

      {/* Display filtered products based on selected category */}
      <div className="row">
        {favoriteProducts.length > 0 ? (
          favoriteProducts.map((product) => (
            <div key={product.Id} className="col-md-4 col-sm-6 mb-4">
              <div className="card">
                <img
                  src={product.Image}
                  className="card-img-top"
                  alt={product.Title}
                  style={{ height: "150px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.Title}</h5>
                  <p className="card-text">{product.Description}</p>
                  <p className="card-text">
                    <strong>Price:</strong> ${product.Price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No products found for this category.</p>
        )}
      </div>
    </div>
  );
};

export default FavoriteCategoryProducts;
