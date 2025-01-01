import React from "react";
import "./CategoryProduct.scss";

const CategoryProduct = ({ selectedCategory, setSelectedCategory }) => {
  const categories = ["All", "Coffee", "Tea", "Juice", "Milktea"];

  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-button ${
            selectedCategory === category ? "active" : ""
          }`}
          onClick={() => setSelectedCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryProduct;
