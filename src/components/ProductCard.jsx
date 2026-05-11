import React from 'react';

export default function ProductCard({ product, isFavorite, onToggleFav, quantity, onChangeQty }) {
  return (
    <div className="product-card">
      <div className="product-emoji">{product.emoji}</div>
      <div className="product-info">
        <div className="product-name-row">
          <h3 className="product-name">{product.name}</h3>
          <button
            className={`fav-star-btn ${isFavorite ? 'starred' : ''}`}
            onClick={() => onToggleFav(product.id)}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
        <p className="product-desc">{product.desc}</p>
        <div className="product-footer">
          <span className="product-price">{product.price.toFixed(2)}€</span>
          <div className="product-tags">
            {product.badges && product.badges.map(badge => (
              <span key={badge} className={`tag tag-${badge.toLowerCase()}`}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="qty-ctrl" style={{ marginTop: '12px' }}>
        <button className="qty-btn" onClick={() => onChangeQty(product.id, -1)}>−</button>
        <span className="qty-num">{quantity}</span>
        <button className="qty-btn" onClick={() => onChangeQty(product.id, 1)}>+</button>
      </div>
    </div>
  );
}