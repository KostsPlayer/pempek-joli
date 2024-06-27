import React from "react";

export default function Summary({
  lengthAllProduct,
  formatPrice,
  costProducts,
  setMethod,
  method,
  address,
  payments,
  setSelectedAddress,
  openPayments,
  setOpenPayments,
  selectedPayment,
  setSelectedPayment,
  totalAmount,
  checkout,
  setSelectedDestination,
  costDistance,
}) {
  return (
    <>
      <div className="cart-summary">
        <div className="cart-summary-title">Summary</div>
        <div className="total-item">
          <div className="text">
            {lengthAllProduct.filter((item) => item.isActive === "true").length}{" "}
            Items
          </div>
          <div className="amount">
            <span>{formatPrice(costProducts)}</span>
          </div>
        </div>
        <div className="collect">
          <div className="title">Collect Method(s)</div>
          <div className="item">
            <input
              type="radio"
              id="shipping"
              name="method"
              value="shipping"
              onChange={(e) => {
                setMethod((prev) => ({
                  ...prev,
                  collect: e.target.value,
                }));
              }}
            />
            <label htmlFor="shipping">Shipping</label>
          </div>
          <div className="item">
            <input
              type="radio"
              id="takeaway"
              name="method"
              value="takeaway"
              onChange={(e) => {
                setMethod((prev) => ({
                  ...prev,
                  collect: e.target.value,
                }));
              }}
            />
            <label htmlFor="takeaway">Take away</label>
          </div>
          <div className="item">
            <input
              type="radio"
              id="dineIn"
              name="method"
              value="dineIn"
              onChange={(e) => {
                setMethod((prev) => ({
                  ...prev,
                  collect: e.target.value,
                }));
              }}
            />
            <label htmlFor="dineIn">Dine-in</label>
          </div>
        </div>
        {method.collect === "shipping" ? (
          <>
            <div className="shipping-method">
              <div className="service">
                <div className="text">Service Fee</div>
                <div className="amount">
                  {formatPrice(parseFloat(costDistance))}
                </div>
              </div>
            </div>
            <div className="address">
              <div className="title">Shipping Address</div>
              <div className="list">
                {address.map((data) => (
                  <div className="item" key={data._id}>
                    <input
                      type="radio"
                      id="address"
                      name="address"
                      onChange={() => {
                        setSelectedAddress(data._id);
                        setSelectedDestination(data.address);
                      }}
                    />
                    <label htmlFor="address">{data.address}</label>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          ""
        )}
        <div className="payment">
          <div className="title">Payment Method(s)</div>
          <div className={`container ${openPayments ? "open" : ""}`}>
            <div
              className="item display"
              onClick={() => setOpenPayments(!openPayments)}
            >
              <div className="name">
                {selectedPayment ? "Metode terpilih" : "Pilih Metode"}
              </div>
              <div className="no-ref">
                {selectedPayment
                  ? selectedPayment.nama_metode
                  : "No.Rekening/No.Hp"}
              </div>
            </div>
            {payments.map((data) => (
              <div
                className="item"
                key={data._id}
                onClick={() => {
                  setOpenPayments(!openPayments);
                  setMethod((prev) => ({
                    ...prev,
                    payment: data._id,
                  }));
                  setSelectedPayment(data);
                }}
              >
                <div className="name">{data.nama_metode}</div>
                <div className="no-ref">{data.deskripsi_metode_pembayaran}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="total-price">
          <div className="text">Total price</div>
          <div className="amount">
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>
        <div className="checkout" onClick={checkout}>
          Checkout
        </div>
      </div>
    </>
  );
}
