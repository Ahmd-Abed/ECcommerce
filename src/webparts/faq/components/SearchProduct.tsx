import React, { useState } from "react";

interface SearchProps {
  onSearch: (searchTerm: string) => void;
}

const SearchProduct: React.FC<SearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // Pass the search term back to the parent
  };

  return (
    <div className="ml-3">
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        className="form-control mb-4"
        placeholder="Search products"
        style={{
          padding: "10px",
          fontSize: "16px",
        }}
      />
    </div>
  );
};

export default SearchProduct;
