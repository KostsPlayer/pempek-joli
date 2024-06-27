import React, { forwardRef, useCallback } from "react";
import dayjs from "dayjs";

function Invoice({ transaction }, ref) {
  const formatPrice = useCallback((price) => {
    const priceInRupiah = price * 1000;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(priceInRupiah);
  }, []);

  return (
    <div ref={ref}>
      <div className="invoice">
        <h2 className="title">Invoice</h2>

        <div className="items">
          <div className="container">
            <strong>Transaction ID</strong>
            <span>:</span>
            <span>{transaction.transactionId}</span>
          </div>
          <div className="container">
            <strong>Amount</strong>
            <span>:</span>
            <span>{formatPrice(transaction.amount)}</span>
          </div>
          <div className="container">
            <strong>Payment Method</strong>
            <span>:</span>
            <span>{transaction.payment}</span>
          </div>
          <div className="container">
            <strong>Collection Method</strong>
            <span>:</span>
            <span>{transaction.collect}</span>
          </div>
          <div className="container">
            <strong>Status</strong>
            <span>:</span>
            <span>{transaction.status}</span>
          </div>
          <div className="container">
            <strong>Date</strong>
            <span>:</span>
            <div>
              <span>
                {dayjs(transaction.date).format("dddd, D MMMM YYYY - h:mm A")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default forwardRef(Invoice);
