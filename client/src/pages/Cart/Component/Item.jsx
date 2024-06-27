import React from "react";

export default function Item({
  productCartData,
  lengthAllProduct,
  deleteCart,
  products,
  toggleActive,
  memoizedImages,
  RemoveQuantity,
  quantities,
  handleQuantityChange,
  AddQuantity,
  formatPrice,
  deleteProduct,
}) {
  return (
    <>
      <div className="cart-item">
        {productCartData.length > 0 ? (
          <>
            <div className="cart-item-title">
              <div className="text">Shopping Cart</div>
              <div className="service">
                <div className="amount">{lengthAllProduct.length} items</div>
                <span className="limit">|</span>
                <span
                  className="material-symbols-outlined"
                  onClick={() => deleteCart()}
                >
                  delete_sweep
                </span>
              </div>
            </div>
            <div className="cart-item-list">
              {products.map((data, index) => {
                const activeProduct = productCartData.find(
                  (item) => item.id_product === data._id
                );
                return (
                  <div className="product" key={data._id}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={
                        activeProduct && activeProduct.isActive
                          ? JSON.parse(activeProduct.isActive)
                          : false
                      }
                      onChange={() => toggleActive(data._id)}
                    />
                    <div className="product-image">
                      <img src={memoizedImages[index]} alt={data.nama_menu} />
                    </div>
                    <div className="product-info">
                      <div className="category">{data.jenis_menu}</div>
                      <div className="name">{data.nama_menu}</div>
                    </div>
                    <div className="product-quantity">
                      <span
                        className="material-symbols-outlined"
                        onClick={() => RemoveQuantity(data._id)}
                      >
                        remove
                      </span>
                      <input
                        type="number"
                        name="quantity"
                        value={quantities[data._id]}
                        onChange={(e) =>
                          handleQuantityChange(
                            data._id,
                            e.target.value,
                            data.stock_menu
                          )
                        }
                        min="0"
                        max={data.stock_menu}
                      />
                      <span
                        className="material-symbols-outlined"
                        onClick={() => AddQuantity(data._id, data.stock_menu)}
                      >
                        add
                      </span>
                    </div>
                    <div className="product-price">
                      {formatPrice(data.harga_menu)}
                    </div>
                    <span
                      className="material-symbols-outlined close"
                      onClick={() => deleteProduct(data._id)}
                    >
                      cancel
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <span className="material-symbols-outlined off">
            shopping_cart_off
          </span>
        )}
      </div>
    </>
  );
}
