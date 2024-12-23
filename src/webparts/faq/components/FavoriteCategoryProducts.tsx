import React, { useEffect, useState } from "react";
import { IProduct } from "../../../IProducts"; // Adjust based on your model
import { useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import Slider from "react-slick"; // Importing Slick Slider
import "./FavoriteCategoryProducts.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const FavoriteCategoryProducts: React.FC = () => {
  const categories = useSelector(
    (state: RootState) => state.product.categories
  );
  const { productItems } = useSelector((state: RootState) => state.product);
  const [favoriteProducts, setFavoriteProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    if (categories.length > 0) {
      const favoriteCategories = categories.filter(
        (category) => category.isFavorite === true
      );

      const favoriteCategory = favoriteCategories[0];
      if (favoriteCategory) {
        const favoriteProduct = productItems.filter(
          (product) => product.Category === favoriteCategory.Title
        );
        setFavoriteProducts(favoriteProduct);
      }
    }
  }, [categories, productItems]);

  // Slick Slider settings
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768, // For smaller devices
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576, // For extra-small devices
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="container my-5 favcontainer ">
      <h2 className="text-center mb-4">Favorite Categories</h2>

      <div className="row justify-content-center">
        {favoriteProducts.length > 0 ? (
          favoriteProducts.length > 4 ? (
            // Slick Slider for more than 4 products
            <Slider {...sliderSettings}>
              {favoriteProducts.map((product) => (
                <div key={product.Id} className="px-2">
                  <div className="card border-0 shadow text-center">
                    <img
                      src={product.Image}
                      className="card-img-top-Fav mx-auto"
                      alt={product.Title}
                    />
                    <div className="card-body">
                      <div className="mb-2">
                        <span className="text-warning">★ ★ ★ ★ ☆</span>
                      </div>
                      <h5 className="card-title-fav mb-2">{product.Title}</h5>
                      <p className="card-text-fav fw-bold">
                        ${product.Price ? product.Price.toFixed(2) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            // Regular Grid for 4 or fewer products
            favoriteProducts.map((product) => (
              <div key={product.Id} className="col-md-3 col-sm-6 mb-4">
                <div className="card border-0 shadow text-center">
                  <img
                    src={product.Image}
                    className="card-img-top-Fav mx-auto"
                    alt={product.Title}
                  />
                  <div className="card-body">
                    <div className="mb-2">
                      <span className="text-warning">★ ★ ★ ★ ☆</span>
                    </div>
                    <h5 className="card-title-fav mb-2">{product.Title}</h5>
                    <p className="card-text-fav fw-bold">
                      ${product.Price ? product.Price.toFixed(2) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          <p>No products found for this category.</p>
        )}
      </div>
    </div>
  );
};

export default FavoriteCategoryProducts;
