import React, { useState, useEffect, useCallback } from "react";
import Notification from "../Notification/Notification";
import { Link, useNavigate } from "react-router-dom";
import GetData from "../../helper/GetData";
import { ReactSocialMediaIcons } from "react-social-media-icons";

export default function Blabar({ nonBorder = false, dashboard = true }) {
  const redirect = useNavigate();
  const { role, session } = GetData();
  const [openNotife, setOpenNotife] = useState(false);

  useEffect(() => {
    console.log(openNotife);
  }, [openNotife]);

  const logout = () => {
    localStorage.removeItem("token");
    redirect("/login", { state: { messageLogout: "Logout Successfully!" } });
  };

  return (
    <>
      <div className={`blabar ${nonBorder ? "non-border" : ""}`}>
        <div className="blabar-top">
          <div className="social-media">
            <ReactSocialMediaIcons
              backgroundColor="transparent"
              borderColor="transparent"
              iconColor="#000"
              size="32"
              icon="facebook"
              url="https://www.facebook.com"
            />
            <ReactSocialMediaIcons
              backgroundColor="transparent"
              borderColor="transparent"
              iconColor="#000"
              size="32"
              icon="twitter"
              url="https://www.twitter.com"
            />
            <ReactSocialMediaIcons
              backgroundColor="transparent"
              borderColor="transparent"
              iconColor="#000"
              size="32"
              icon="instagram"
              url="https://www.instagram.com"
            />
          </div>
          <Link className="logo" to={"/"}>
            Pempek Joli
          </Link>
          <div className="icon">
            {session && dashboard ? (
              <div
                className="nav-link"
                onClick={() => {
                  setOpenNotife(true);
                }}
              >
                <span className="material-symbols-outlined">notifications</span>
              </div>
            ) : (
              ""
            )}
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
        <div className="blabar-bottom">
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
      {openNotife ? (
        <Notification
          openNotife={openNotife}
          closeNotife={() => setOpenNotife(false)}
        />
      ) : (
        ""
      )}
    </>
  );
}
