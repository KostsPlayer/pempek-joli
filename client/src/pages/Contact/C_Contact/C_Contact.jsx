import React, { useState, useEffect } from "react";
import { ReactSocialMediaIcons } from "react-social-media-icons";
import emailjs from "@emailjs/browser";

// import axios from "axios";

export default function C_Contact() {
  const [data, setData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    subject: "",
    selectLocation: "",
    commentMessage: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .send(
        import.meta.env.VITE_EMAIL_SERVICE,
        import.meta.env.VITE_EMAIL_TEMPLATE,
        data,
        {
          publicKey: import.meta.env.VITE_EMAIL_PUBLIC_KEY,
        }
      )
      .then((res) => {
        console.log("Sucess!", res.status, res.text);
      })
      .catch((err) => {
        console.log("Failed...", err);
      });
    console.log(data);
  };

  return (
    <>
      <div className="c-contact">
        <div className="c-contact-content">
          <div className="profile">
            <div className="profile-office">
              <div className="title">Corporate Office</div>
              <div className="location">
                <span className="material-symbols-outlined">location_on</span>
                <span>Universitas Logistik & Bisnis Internasional</span>
              </div>
              <div className="phone-number">
                <span className="material-symbols-outlined">call</span>
                <span>+62123 4567 8901</span>
              </div>
              <div className="mail">
                <span className="material-symbols-outlined">mail</span>
                <span>todos@gmail.com</span>
              </div>
            </div>
            <div className="profile-connected">
              <div className="title">Stay Connected</div>
              <div className="social-media">
                <ReactSocialMediaIcons
                  backgroundColor="transparent"
                  borderColor="transparent"
                  iconColor="#ff5100"
                  size="39"
                  icon="facebook"
                  url="https://www.facebook.com"
                />
                <ReactSocialMediaIcons
                  backgroundColor="transparent"
                  borderColor="transparent"
                  iconColor="#ff5100"
                  size="39"
                  icon="twitter"
                  url="https://www.twitter.com"
                />
                <ReactSocialMediaIcons
                  backgroundColor="transparent"
                  borderColor="transparent"
                  iconColor="#ff5100"
                  size="39"
                  icon="instagram"
                  url="https://www.instagram.com"
                />
                <ReactSocialMediaIcons
                  backgroundColor="transparent"
                  borderColor="transparent"
                  iconColor="#ff5100"
                  size="39"
                  icon="youtube"
                  url="https://www.youtube.com"
                />
              </div>
            </div>
          </div>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-title">We love to hear you</div>
            <div className="form-description">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nobis
              neque harum omnis accusantium quam dolores blanditiis quisquam
              repellat.
            </div>
            <div className="form-content">
              <div className="form-content-input">
                <label htmlFor="fullname">
                  Fullname <span>*</span>
                </label>
                <input
                  onChange={handleChange}
                  type="text"
                  name="fullname"
                  id="fullname"
                />
              </div>
              <div className="form-content-input">
                <label htmlFor="email">
                  Email <span>*</span>
                </label>
                <input
                  onChange={handleChange}
                  type="text"
                  name="email"
                  id="email"
                />
              </div>
              <div className="form-content-input">
                <label htmlFor="phoneNumber">
                  Phone Number <span>*</span>
                </label>
                <input
                  onChange={handleChange}
                  type="number"
                  name="phoneNumber"
                  id="phoneNumber"
                />
              </div>
              <div className="form-content-input">
                <label htmlFor="subject">
                  Subject <span>*</span>
                </label>
                <input
                  onChange={handleChange}
                  type="text"
                  name="subject"
                  id="subject"
                />
              </div>
              <div className="form-content-input">
                <label htmlFor="selectLocation">
                  Select Location <span>*</span>
                </label>
                <select
                  onChange={handleChange}
                  name="selectLocation"
                  id="selectLocation"
                >
                  <option value="" disabled selected>
                    Select Location
                  </option>
                  <option value="london">London</option>
                  <option value="madrid">Madrid</option>
                  <option value="paris">Paris</option>
                  <option value="tokyo">Tokyo</option>
                </select>
              </div>
              <div className="form-content-input">
                <label htmlFor="commentMessage">
                  Comment or Message <span>*</span>
                </label>
                <textarea
                  onChange={handleChange}
                  name="commentMessage"
                  id="commentMessage"
                ></textarea>
              </div>
              <button type="submit" className="form-content-button">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
