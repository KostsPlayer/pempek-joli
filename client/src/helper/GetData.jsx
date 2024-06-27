import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function GetData() {
  const [session, setSession] = useState(false);
  const [role, setRole] = useState(null);

  const getToken = localStorage.getItem("token");

  useEffect(() => {
    if (getToken) {
      const decodedToken = jwtDecode(getToken);
      setRole(decodedToken.role);
      setSession(true);
    } else {
      setSession(false);
    }
  }, []);

  return { session, role, getToken };
}
