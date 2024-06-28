import React, { useState, useEffect, useCallback, useMemo } from "react";
import image from "./../../assets/images/user_187488.png";

function Notification({ openNotife, closeNotife }) {
  if (!openNotife) return null;

  return (
    <>
      <div className="notification" onClick={closeNotife}>
        <div
          className="overlay"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="day">Today</div>
          <div className="item">
            <div className="content">
              <div className="text">
                <span>Pesanan masuk! </span>
                Pengguna* telah memesan produk.
              </div>
            </div>
            <div className="time">99h ago</div>
          </div>
          <div className="item">
            <div className="content">
              <div className="text">
                <span>Pembayaran selesai! </span>
                Pengguna* telah melakukan pembayaran.
              </div>
            </div>
            <div className="time">99h ago</div>
          </div>
          <div className="item">
            <div className="content">
              <div className="text">
                <span>Pemesanan dibatalkan! </span>
                Pengguna* telah membatalkan pesanan.
              </div>
            </div>
            <div className="time">99h ago</div>
          </div>
          <div className="item">
            <div className="content">
              <div className="text">
                <span>Pemesanan dibatalkan! </span>
                Pengguna* telah membatalkan pesanan.
              </div>
            </div>
            <div className="time">99h ago</div>
          </div>
          <div className="all-message">Show All Message</div>
        </div>
      </div>
    </>
  );
}

export default Notification;
