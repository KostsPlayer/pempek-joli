import React, { useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import GetData from "../../helper/GetData";

export default function Sidebar() {
  const { role } = GetData();
  const { id } = useParams();

  return (
    <>
      <div className="sidebar">
        <NavLink to={"/profile"} className="sidebar-item">
          <span className="role">{role}</span>
          <span className="material-symbols-outlined">manage_accounts</span>
          <span className="text">Profile</span>
        </NavLink>
        <NavLink to={"/notification-all"} className="sidebar-item">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text">Notification</span>
        </NavLink>
        {role === "admin" ? (
          <>
            <NavLink to={"/transaction"} className="sidebar-item">
              <span className="material-symbols-outlined">point_of_sale</span>
              <span className="text">Transaction</span>
            </NavLink>
            <NavLink to={"/store"} className="sidebar-item">
              <span className="material-symbols-outlined">store</span>
              <span className="text">Store</span>
            </NavLink>
            {id === undefined || "" ? (
              ""
            ) : (
              <NavLink to={"/go-shopping"} className="sidebar-item">
                <span className="material-symbols-outlined">map</span>
                <span className="text">Map</span>
              </NavLink>
            )}
          </>
        ) : (
          ""
        )}
      </div>
    </>
  );
}
