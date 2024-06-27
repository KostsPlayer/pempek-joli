import React from "react";
import Cursor from "../../helper/Cursor";
import SmoothScroll from "../../helper/SmoothScroll";
import Footer from "../../component/Footer/Footer";
import C_Hero from "./C_Hero/C_Hero";
import C_Contact from "./C_Contact/C_Contact";
import C_Outlet from "./C_Outlet/C_Outlet";

export default function Contact() {
  return (
    <>
      <Cursor />
      <SmoothScroll />
      <C_Hero />
      <C_Contact />
      <C_Outlet />
      <Footer />
    </>
  );
}
