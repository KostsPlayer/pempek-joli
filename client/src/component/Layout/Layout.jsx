import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import Blabar from "../Blabar/Blabar";
import Footer from "../Footer/Footer";
import Cursor from "../../helper/Cursor";
import SmoothScroll from "../../helper/SmoothScroll";

export default function Layout({ children }) {
  return (
    <>
      <Cursor />
      <SmoothScroll />
      <Blabar />
      <div className="layout">
        <div className="content">{children}</div>
        <Sidebar />
      </div>
      <Footer />
    </>
  );
}
