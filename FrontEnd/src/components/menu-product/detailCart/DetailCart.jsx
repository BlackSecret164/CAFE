import React, { useState } from 'react';
import './DetailCart.scss';


const DetailCart = ({ cartItems, setCartItems}) => {

  const [serveType, setServeType] = useState("dine-in"); // Dùng state để lưu loại phục vụ
  
  const handleServeTypeChange = (type) => {
    setServeType(type); // Cập nhật loại phục vụ khi người dùng chọn
  }; 

  const handleRemoveItem = (id, size, mood) => {
    setCartItems((prevCart) =>
      prevCart.filter(
        (item) => item.id !== id || item.size !== size || item.mood !== mood
      )
    );
  };

  const handleUpdateQuantity = (id, size, mood, newQuantity) => {
    
    if (newQuantity <= 0) {
      handleRemoveItem(id, size, mood);
      return;
    }

    setCartItems((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.size === size && item.mood === mood
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price, 0);
  const discount = 3; // Giảm giá cố định (có thể thay đổi)
  const finalTotal = total - discount;


  return (
    <div className="detail-cart">
      {/* Title */}
      <div className="title-cart">
        <h3>BILL</h3>
      </div>

      {/* Serve Type Selection */}
      <div className="serve-type">
        <div className="serve-buttons">
          <button
            className={`serve-button ${serveType === 'dine-in' ? 'active' : ''}`}
            onClick={() => handleServeTypeChange('dine-in')}
          >
            Dine In
          </button>
          <button
            className={`serve-button ${serveType === 'take-away' ? 'active' : ''}`}
            onClick={() => handleServeTypeChange('take-away')}
          >
            Take Away
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="customer-info">
        <div className="info-row">
          <label className="info-lbl">Số điện thoại</label>
          <input type="text" placeholder="Tìm kiếm số điện thoại" />
        </div>
        <div className="info-row">
          <label className="info-lbl">Tên</label>
          <input type="text" placeholder="Tên khách hàng" />
        </div>
        <div className="info-row">
          <label className="info-lbl">Ngày </label>
          <input type="datetime-local" value={new Date().toISOString().slice(0, 16)} readOnly />
        </div>
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        <label>Cart Items</label>
        {cartItems.length === 0 ? ( // Kiểm tra xem giỏ hàng có trống không
          <p className="empty-cart-message">Giỏ hàng trống</p>
        ) : (
          cartItems.map((item) => (
            //<div key={item.id} className="cart-item">
            <div key={`${item.id}-${item.size}-${item.mood}`} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
      
              <div className="cart-item-info">
                <span><strong>{item.name}</strong></span>
                <span>Size: {item.size}</span>
                <span>Mood: {item.mood}</span>
                {/* <span>{item.quantity} x {item.price}k</span> */}
              </div>

              <div className="cart-item-actions">
                <button onClick={() => handleUpdateQuantity(item.id, item.size, item.mood, item.quantity - 1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => handleUpdateQuantity(item.id, item.size, item.mood, item.quantity + 1)}>
                  +
                </button>
                <button className="delete" onClick={() => handleRemoveItem(item.id, item.size, item.mood)}>
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>

              <div className="cart-item-total">
                <span>{item.quantity * item.price}k</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total Price */}
      <div className="cart-summary">
        <label>Order Summary</label>
        <div className="cart-summary-item">
          <span>Items</span>
          <span>{cartItems.length}</span>
        </div>
        <div className="cart-summary-item">
          <span>Discount</span>
          <span>-{discount}k</span>
        </div>
        <div className="cart-summary-total">
          <h3>Total</h3>
          <h3>{finalTotal}k</h3>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="place-order">
        <button>Place an order</button>
      </div>
    </div>
  );
};

export default DetailCart;
