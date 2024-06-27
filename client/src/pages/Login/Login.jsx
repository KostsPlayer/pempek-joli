import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cursor from "../../helper/Cursor";
import SmoothScroll from "../../helper/SmoothScroll";
import AlertMessage from "../../helper/AlertMessage";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import imagePath from "./../../assets/images/pork-meatballs-wooden-surface.jpg";

const GenerateImages = () => {
  return Array.from({ length: 6 }, (_, index) => (
    <div key={index} className={`content set-${index + 1}`}>
      <img src={imagePath} className="content-image" />
    </div>
  ));
};

export default function Login() {
  axios.defaults.withCredentials = true;

  const { toastMessage } = AlertMessage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.messageSignUp) {
      toastMessage("success", location.state.messageSignUp);
      navigate(location.pathname, {
        state: { ...location.state, messageSignUp: undefined },
        replace: true,
      });
    }

    if (location.state?.messageLogout) {
      toastMessage("success", location.state.messageLogout);
      navigate(location.pathname, {
        state: { ...location.state, messageLogout: undefined },
        replace: true,
      });
    }
  }, [location.state, navigate, toastMessage, location.pathname]);

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    axios
      .post("https://pempek-joli-server.vercel.app/api/auth/login", values)
      .then((res) => {
        localStorage.setItem(
          "token",
          JSON.stringify({
            token: res.data.data.token,
          })
        );

        const getToken = res.data.data.token;
        const decodedToken = jwtDecode(getToken);

        if (decodedToken.role === "admin") {
          navigate("/transaction", {
            state: { messageLogin: "Login successfully!" },
          });
        } else {
          navigate("/", { state: { messageLogin: "Login successfully!" } });
        }
      })
      .catch((errors) => {
        console.log(errors);
      });
  };

  return (
    <>
      <Cursor />
      <SmoothScroll />
      <div className="login">
        <div className="login-image">
          <div className="container">
            <GenerateImages />
          </div>
        </div>
        <div className="login-form">
          <span
            className="material-symbols-outlined"
            onClick={() => {
              navigate("/");
            }}
          >
            arrow_back
          </span>
          <div className="title">Login</div>
          <form className="form" onSubmit={handleLogin}>
            <input
              type="text"
              name="email"
              placeholder="Email"
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />
            <button type="submit">Submit</button>
            <div className="form-link">
              <Link className="to-link" to={"/"}>
                Forgot Password?
              </Link>
              <span>
                Don't have an account?{" "}
                <Link className="to-link" to={"/sign-up"}>
                  SignUp{" "}
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
