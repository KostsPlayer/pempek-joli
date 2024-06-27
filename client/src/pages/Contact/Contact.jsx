import React, { useEffect, useState } from "react";
import Loader from "../../helper/Loader";
import Cursor from "../../helper/Cursor";
import SmoothScroll from "../../helper/SmoothScroll";
import Footer from "../../component/Footer/Footer";
import C_Hero from "./C_Hero/C_Hero";
import C_Contact from "./C_Contact/C_Contact";
import C_Outlet from "./C_Outlet/C_Outlet";

export default function Contact() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Cursor />
          <SmoothScroll />
          <C_Hero />
          <C_Contact />
          <C_Outlet />
          <Footer />
        </>
      )}
    </>
  );
}
