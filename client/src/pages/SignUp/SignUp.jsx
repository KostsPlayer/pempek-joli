import React, { useState, useEffect, useMemo } from "react";
import Loader from "../../helper/Loader";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Cursor from "../../helper/Cursor";
import SmoothScroll from "../../helper/SmoothScroll";
import imagePath from "./../../assets/images/pork-meatballs-wooden-surface.jpg";

const GenerateImages = () => {
  return Array.from({ length: 6 }, (_, index) => (
    <div key={index} className={`content set-${index + 1}`}>
      <img src={imagePath} className="content-image" />
    </div>
  ));
};

export default function SignUp() {
  axios.defaults.withCredentials = true;

  const redirect = useNavigate();
  const [values, setValues] = useState({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSignUp = (e) => {
    e.preventDefault();

    axios
      .post("https://pempek-joli-server.vercel.app/api/auth/register", values)
      .then((res) => {
        console.log(res.data);
        redirect("/login", {
          state: { messageSignUp: "Registrarion Successfully!" },
        });
      })
      .catch((errors) => {
        console.log(errors);
      });
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Cursor />
          <SmoothScroll />
          <div className="sign-up">
            <div className="sign-up-image">
              <div className="container">
                <GenerateImages />
              </div>
            </div>
            <div className="sign-up-form">
              <span
                className="material-symbols-outlined"
                onClick={() => {
                  redirect("/");
                }}
              >
                arrow_back
              </span>
              <div className="title">Sign Up</div>
              <form className="form" onSubmit={handleSignUp}>
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Fullname"
                  onChange={handleChange}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                />
                <button type="submit">Submit</button>
                <div className="form-link">
                  <Link className="to-link" to={"/"}>
                    Forgot Password?
                  </Link>
                  <span>
                    Have an account?{" "}
                    <Link className="to-link" to={"/login"}>
                      Login{" "}
                    </Link>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
