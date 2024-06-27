import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import image from "./../../../assets/images/413001-PE73CF-559.jpg";
import axios from "axios";

export default function Receipt({ onClose, onOpen, token, paymentId }) {
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(image);
  const [sendReceipt, setSendReceipt] = useState(null);

  const handleImageChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      setSendReceipt(file);

      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
      }
    },
    [setSelectedImage]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("bukti_pembayaran", sendReceipt);

      await axios
        .put(
          `https://pempek-joli-server.vercel.app/api/upload/payments/${paymentId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          // console.log(res.data);
          navigate("/", {
            state: { messageOrder: "Transaction Successfully!" },
          });
        })
        .catch((err) => {
          console.error(err);
        });
    },
    [navigate, paymentId, token, sendReceipt]
  );

  if (!onOpen) return null;

  return (
    <>
      <div className="overlay-modal" onClick={onClose}>
        <div
          className="modal-area"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <span className="title">Receipt</span>
          <span className="material-symbols-outlined" onClick={onClose}>
            cancel
          </span>
          <form className="form-receipt" onSubmit={handleSubmit}>
            <div className="form-content">
              <input
                type="file"
                name="bukti_pembayaran"
                id="bukti_pembayaran"
                onChange={handleImageChange}
              />
            </div>
            <div className="form-content">
              <img src={selectedImage} alt="" />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </>
  );
}
