import React from "react";
import { Link } from "react-router-dom";

export default function H_Feature() {
  return (
    <>
      <div className="h-feature">
        <div className="h-feature-text">Bringing Happiness To You</div>
        <div className="h-feature-content">
          <div className="container">
            <div className="image">
              <span className="material-symbols-outlined">smartphone</span>
            </div>
            <div className="title">Onlive Delivery</div>
            <Link className="link">Order Online</Link>
          </div>
          <div className="container">
            <div className="image">
              <span className="material-symbols-outlined">package_2</span>
            </div>
            <div className="title">Click & Collect</div>
            <Link className="link">Takeout Order</Link>
          </div>
          <div className="container">
            <div className="image">
              <span className="material-symbols-outlined">local_dining</span>
                </div>
            <div className="title">Restaurant Dining</div>
            <Link className="link">Take A Table</Link>
          </div>
        </div>
      </div>
    </>
  );
}
