import React from "react";
import { Link } from "react-router-dom";
import { ReactSocialMediaIcons } from "react-social-media-icons";

export default function Footer() {
  return (
    <>
      <div className="footer">
        <div className="footer-left">
          <Link className="logo" to={"/"}>
            Pempek Joli
          </Link>
          <div className="description">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptate
            corporis itaque natus dolore suscipit quam?
          </div>
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
        </div>
        <div className="footer-right">
          <div className="container">
            <div className="title">About Us</div>
            <Link className="link" to={"/"}>
              Our Story
            </Link>
            <Link className="link" to={"/"}>
              Our Locations
            </Link>
            <Link className="link" to={"/"}>
              Current Deals
            </Link>
            <Link className="link" to={"/"}>
              Contact Us
            </Link>
          </div>
          <div className="container">
            <div className="title">Our Menu</div>
            <Link className="link" to={"/"}>
              Pempek 1
            </Link>
            <Link className="link" to={"/"}>
              Pempek 2
            </Link>
            <Link className="link" to={"/"}>
              Pempek 3
            </Link>
            <Link className="link" to={"/"}>
              Pempek 4
            </Link>
          </div>
          <div className="container">
            <div className="title">Pempek Joli</div>
            <Link className="link" to={"/"}>
              Pempek Joli London
            </Link>
            <Link className="link" to={"/"}>
              Pempek Joli Paris
            </Link>
            <Link className="link" to={"/"}>
              Pempek Joli Madrid
            </Link>
            <Link className="link" to={"/"}>
              Pempek Joli Tokyo
            </Link>
          </div>
        </div>
      </div>
      <div className="credit">
        <span>Copyright &copy; 2024 Pempek Joli</span>
        <span>Powered by Pempek Joli</span>
      </div>
    </>
  );
}
