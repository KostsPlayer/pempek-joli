import React from "react";
import Navbar from "../../../component/Navbar/Navbar";

export default function M_Hero() {
  return (
    <>
      <div className="m-hero">
        <Navbar />
        <div className="m-hero-content">
          <h1 className="title">Our Menu</h1>
        </div>
      </div>
    </>
  );
}
