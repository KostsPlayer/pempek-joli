import React, { useState, useEffect } from "react";
import Cursor from "../../helper/Cursor";
import SmoothScroll from "../../helper/SmoothScroll";
import M_Hero from "./M_Hero/M_Hero";
import M_Catalog from "./M_Catalog/M_Catalog";
import M_Outlet from "./M_Outlet/M_Outlet";
import Footer from "../../component/Footer/Footer";
import Loader from "../../helper/Loader";

export default function Menu() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Cursor />
          <SmoothScroll />
          <M_Hero />
          <M_Catalog />
          <M_Outlet />
          <Footer />
        </>
      )}
    </>
  );
}
