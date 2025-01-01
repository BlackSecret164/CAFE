import React, { useState } from 'react';
import './MenuContent.scss';
import { menuData } from '../data/menuData';
import SearchProduct from '@/components/search-product/SearchProduct';
import CategoryProduct from '@/components/category-product/CategoryProduct';
import ActionButton from '../actionButton/ActionButton';
import PaginationContent from '@/components/pagination/PaginationContent';
import DetailCart from '../detailCart/DetailCart';

const MenuContent = () => {
  const [orders, setOrders] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSize, setSelectedSize] = useState({}); // To track selected size for each item
  const [selectedMood, setSelectedMood] = useState({}); // To track selected mood for each item

  // Filter and Paginate Menu Items
  const filteredMenu = menuData.filter(
    (item) =>
      (selectedCategory === "All" || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const [quantity, setQuantity] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredMenu.length / quantity);
  const startIndex = (currentPage - 1) * quantity;
  const endIndex = startIndex + quantity;
  const currentData = filteredMenu.slice(startIndex, endIndex);

  const items = {
    currentPage,
    setCurrentPage,
    totalPages,
    setQuantity,
    quantity,
  };

  const handleIncrease = (id) => {
    setOrders((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrease = (id) => {
    setOrders((prev) => {
      if (!prev[id] || prev[id] <= 1) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: prev[id] - 1 };
    });
  };

  const handleOrder = (item) => {
    const selectedItemSize = selectedSize[item.id];
    const selectedItemMood = selectedMood[item.id];
    if (!selectedItemSize || !selectedItemMood || orders[item.id] <= 0) {
      alert('Vui lòng chọn kích thước, tâm trạng và số lượng hợp lệ.');
      return;
    }

    const quantity = orders[item.id] || 1;  // Đảm bảo số lượng là 1 nếu không có giá trị hợp lệ
    const price = item.sizes[selectedItemSize];  // Lấy giá từ size đã chọn
  
    const newItem = {
      ...item,
      quantity,
      size: selectedItemSize,
      mood: selectedItemMood,
      price,
    };
  
    handleAddToCart(newItem, quantity);
    alert(`Sản phẩm ${item.name} (Mood: ${selectedItemMood}, Size: ${selectedItemSize}) đã được thêm vào giỏ hàng.`);
  
    // Reset selected mood and size for the current item
    setSelectedMood((prev) => ({ ...prev, [item.id]: null }));
    setSelectedSize((prev) => ({ ...prev, [item.id]: null }));
  }; 

  
  

  const handleAddToCart = (item, quantity) => {
    const existingItemIndex = cartItems.findIndex(
      (cartItem) =>
        cartItem.id === item.id &&
        cartItem.size === item.size &&
        cartItem.mood === item.mood
    );
  
    if (existingItemIndex !== -1) {
      // Nếu sản phẩm đã tồn tại, tăng số lượng
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += quantity;
      setCartItems(updatedCart);
    } else {
      // Nếu sản phẩm mới, thêm vào giỏ hàng
      setCartItems((prevCart) => [
        ...prevCart,
        {
          ...item,
          quantity: quantity || 1,
        },
      ]);
    }
  };

  
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handleSizeSelect = (id, size) => {
    setSelectedSize((prev) => ({ ...prev, [id]: size }));
  };

  const handleMoodSelect = (id, mood) => {
    setSelectedMood((prev) => ({ ...prev, [id]: mood }));
  };

  return (
      <div className="menu-content">
      <div className="left-side">
        <div className="controls">
          <CategoryProduct onCategoryChange={handleCategoryChange} setSelectedCategory={setSelectedCategory} />
          <SearchProduct onSearch={handleSearch} />
        </div>
        <div className="menu-items">
          {currentData.map((item) => (
            <div key={item.id} className="menu-item">
              {/* Left Side: Image and Quantity Controls */}
                <div className="item-picture">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-quantity">  
                    <ActionButton
                      count={orders[item.id] || 1}
                      onIncrease={() => handleIncrease(item.id)}
                      onDecrease={() => handleDecrease(item.id)}
                    />
                  </div> 
                </div>

              {/* Right Side: Details */}
              <div className="item-right">
                <h3 className="item-name">{item.name}</h3>

                {/* Mood Selector */}
                <div className="item-mood">
                  <label>Mood:</label>
                  <div className="mood-options">
                    {item.mood.map((m) => (
                      <button
                        key={m}
                        className={`mood-button ${selectedMood[item.id] === m ? 'active' : ''}`}
                        onClick={() => handleMoodSelect(item.id, m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="item-size-selector">
                  <label className="size-label">Size:</label>
                  <div className="size-options">
                    {Object.keys(item.sizes).map((size) => (
                      <button
                        key={size}
                        className={`size-button ${selectedSize[item.id] === size ? 'active' : ''}`}
                        onClick={() => handleSizeSelect(item.id, size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Display */}
                <div className="item-price-display">
                  <label className="price-label">Price:</label>
                  <div className="price-options">
                    {Object.entries(item.sizes).map(([size, price]) => (
                      <span
                        key={size}
                        className={`price-tag ${selectedSize[item.id] === size ? 'highlight' : ''}`}
                      >
                        {selectedSize[item.id] === size ? <b>{price}k</b> : `${price}k`}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="button-order"
                  onClick={() => handleOrder(item)}
                >
                  Đặt hàng</button>
              </div>
            </div>
          ))}
        </div>
        <PaginationContent items={items} />
      </div>

      {/* Right side: Bill (DetailCart) */}
      <div className="right-side">
        <DetailCart cartItems={cartItems} setCartItems={setCartItems} />
      </div>
    </div>
  );
};

export default MenuContent;
