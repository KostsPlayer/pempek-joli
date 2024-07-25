import React, { useEffect, useState } from "react";
import Cursor from "../../helper/Cursor";
import SmoothScroll from "../../helper/SmoothScroll";
import H_Hero from "./H_Hero/H_Hero";
import H_Advantage from "./H_Advantage/H_Advantage";
import H_Feature from "./H_Feature/H_Feature";
import H_Catalog from "./H_Catalog/H_Catalog";
import Footer from "../../component/Footer/Footer";
import Loader from "../../helper/Loader";
import AlertMessage from "../../helper/AlertMessage";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

export default function Home() {
  const { toastMessage } = AlertMessage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.messageLogin) {
      toastMessage("success", location.state.messageLogin);
      navigate(location.pathname, {
        state: { ...location.state, messageLogin: undefined },
        replace: true,
      });
    }

    if (location.state?.messageOrder) {
      toastMessage("success", location.state.messageOrder);
      navigate(location.pathname, {
        state: { ...location.state, messageOrder: undefined },
        replace: true,
      });
    }
  }, [location.state, location.pathname, navigate, toastMessage]);

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
          <H_Hero />
          {/* <H_Advantage /> */}
          <H_Feature />
          <H_Catalog />
          <Footer />
        </>
      )}
      <ToastContainer />
    </>
  );
}
