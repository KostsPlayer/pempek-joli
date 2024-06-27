import React from "react";
import Navbar from "../../../component/Navbar/Navbar";

export default function H_Hero() {
  return (
    <>
      <div className="h-hero">
        <Navbar />
        <div className="h-hero-content">
          <h1 className="title">Pempek Autentik, Nikmati Keaslian Rasa</h1>
          <span className="subtitle">
            Nikmati pempek autentik Palembang yang lezat dan sehat di sini.
            Dibuat dengan resep tradisional dan bahan berkualitas, tersedia
            berbagai jenis pempek dengan kuah cuko kental. Pesan sekarang dan
            rasakan kelezatan aslinya!
          </span>
          <div className="button">
            <div className="button-1">Book a Table</div>
            <div className="button-2">Takeaway</div>
          </div>
        </div>
      </div>
    </>
  );
}
