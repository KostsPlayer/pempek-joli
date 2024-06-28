import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReactSocialMediaIcons } from "react-social-media-icons";
import GetData from "../../helper/GetData";

export default function Navbar() {
  const redirect = useNavigate();
  const { role, session} = GetData();

  const logout = () => {
    localStorage.removeItem("token");
    redirect("/login", { state: { messageLogout: "Logout Successfully!" } });
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar-top">
          <div className="social-media">
            <ReactSocialMediaIcons
              backgroundColor="transparent"
              borderColor="transparent"
              iconColor="#fff"
              size="32"
              icon="facebook"
              url="https://www.facebook.com"
            />
            <ReactSocialMediaIcons
              backgroundColor="transparent"
              borderColor="transparent"
              iconColor="#fff"
              size="32"
              icon="twitter"
              url="https://www.twitter.com"
            />
            <ReactSocialMediaIcons
              backgroundColor="transparent"
              borderColor="transparent"
              iconColor="#fff"
              size="32"
              icon="instagram"
              url="https://www.instagram.com"
            />
          </div>
          <Link className="logo" to={"/"}>
            Pempek Joli
          </Link>
          <div className="icon">
            <Link className="nav-link" to={"/cart"}>
              <span className="material-symbols-outlined">local_mall</span>
            </Link>
            {session ? (
              <>
                {role === "admin" ? (
                  <Link className="nav-link" to={"/profile"}>
                    <span className=" material-symbols-outlined">
                      shield_person
                    </span>
                  </Link>
                ) : (
                  <Link className="nav-link" to={"/profile"}>
                    <span className="material-symbols-outlined">
                      account_circle
                    </span>
                  </Link>
                )}
              </>
            ) : (
              <Link className="nav-link" to={"/login"}>
                <span className="material-symbols-outlined">person</span>
              </Link>
            )}
            {session ? (
              <div className="nav-link">
                <span className="material-symbols-outlined" onClick={logout}>
                  logout
                </span>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="navbar-bottom">
          <Link className="nav-link" to={"/"}>
            Home
          </Link>
          <Link className="nav-link" to={"/menu"}>
            Menu
          </Link>
          <Link className="nav-link" to={"/contact"}>
            Contact Us
          </Link>
          <Link className="nav-link" to={"/order"}>
            Pesanan
          </Link>
        </div>
      </div>
    </>
  );
}
