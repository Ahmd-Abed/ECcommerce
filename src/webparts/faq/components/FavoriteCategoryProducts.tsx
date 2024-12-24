import React, { useEffect, useState } from "react";
import { IProduct } from "../../../IProducts";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import Slider from "react-slick";
import "./FavoriteCategoryProducts.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const FavoriteCategoryProducts: React.FC = () => {
  const categories = useSelector(
    (state: RootState) => state.product.categories
  );
  const { productItems } = useSelector((state: RootState) => state.product);
  const [favoriteCategories, setFavoriteCategories] = useState<
    { title: string; products: IProduct[] }[]
  >([]);

  useEffect(() => {
    if (categories.length > 0) {
      const favoriteCategories = categories
        .filter((category) => category.isFavorite === true)
        .map((category) => {
          const products = productItems.filter(
            (product) => product.Category === category.Title
          );
          return { title: category.Title, products };
        });
      setFavoriteCategories(favoriteCategories);
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
    <div className="favorite-categories-container my-5 favcontainer">
      {favoriteCategories.length > 0 ? (
        favoriteCategories.map(({ title, products }) => (
          <div key={title} className="category-container container my-4">
            {/* Category Header */}
            <h2 className="text-center mb-4">{title} Category</h2>

            {/* Products Display */}
            <div className="row justify-content-center">
              {products.length > 4 ? (
                // Slick Slider for more than 4 products
                <Slider {...sliderSettings}>
                  {products.map((product) => (
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
                          <h5 className="card-title-fav mb-2">
                            {product.Title}
                          </h5>
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
                products.map((product) => (
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
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No favorite categories found.</p>
      )}
    </div>
  );
};

export default FavoriteCategoryProducts;
