import React from "react";
import Cursor from "../../helper/Cursor";
import SmoothScroll from "../../helper/SmoothScroll";
import M_Hero from "./M_Hero/M_Hero";
import M_Catalog from "./M_Catalog/M_Catalog";
import M_Outlet from "./M_Outlet/M_Outlet";
import Footer from "../../component/Footer/Footer";

export default function Menu() {
  return (
    <>
      <Cursor />
      <SmoothScroll />
      <M_Hero />
      <M_Catalog />
      <M_Outlet />
      <Footer />
    </>
  );
}
