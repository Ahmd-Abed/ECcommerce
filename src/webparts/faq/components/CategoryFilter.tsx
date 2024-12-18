import React from "react";
import styles from "./Faq.module.scss";
import { ICategory } from "../../../ICategory";
interface CategoryFilterProps {
  categories: ICategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className={styles.Category}>
      <select
        className="mb-4"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      >
        {categories.map((category) => (
          <option key={category.Id} value={category.Title}>
            {category.Title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
