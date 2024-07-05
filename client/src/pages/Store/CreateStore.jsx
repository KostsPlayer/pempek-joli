import React, { useState, useCallback } from "react";
import axios from "axios";
import AlertMessage from "../../helper/AlertMessage";
import { ToastContainer } from "react-toastify";
import GetData from "../../helper/GetData";
import initialImage from "./../../assets/images/366841-PB2ZVB-92.jpg";

export default function CreateStore({ onOpen, onClose, refreshData }) {
  axios.defaults.withCredentials = true;

  const { toastMessage } = AlertMessage();
  const { getToken } = GetData();
  const objectToken = JSON.parse(getToken);
  const token = objectToken.token;

  const [values, setValues] = useState({
    nama_menu: "",
    jenis_menu: "",
    harga_menu: 0,
    stock_menu: 0,
    description: "",
    image: null,
  });

  const [selectedImage, setSelectedImage] = useState(initialImage);

  const handleImageChange = useCallback(
    (e) => {
      const file = e.target.files[0];

      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
      }
    },
    [setSelectedImage]
  );

  const handleChange = useCallback(
    (e) => {
      if (e.target.type === "file") {
        setValues({ ...values, [e.target.name]: e.target.files[0] });
        handleImageChange(e);
      } else {
        if (
          (e.target.name === "harga_menu" || e.target.name === "stock_menu") &&
          e.target.value < 0
        ) {
          toastMessage("error", "Cannot be negative");
        } else {
          setValues({ ...values, [e.target.name]: e.target.value });
        }
      }
    },
    [values, handleImageChange, toastMessage]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("nama_menu", values.nama_menu);
      formData.append("jenis_menu", values.jenis_menu);
      formData.append("harga_menu", values.harga_menu);
      formData.append("stock_menu", values.stock_menu);
      formData.append("description", values.description);
      formData.append("img_menu", values.image);

      // Log FormData to console
      // for (let pair of formData.entries()) {
      //   console.log(`${pair[0]}: ${pair[1]}`);
      // }

      axios
        .post("https://pempek-joli-server.vercel.app/api/product", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          toastMessage("success", res.data.message);
          onClose();
          refreshData();
        })
        .catch((errors) => {
          toastMessage("error", errors.response.data.error);
          console.error(errors);
        });
    },
    [values, token, toastMessage, onClose, refreshData]
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
          <span className="title">Insert Modal</span>
          <span className="material-symbols-outlined" onClick={onClose}>
            cancel
          </span>
          <form
            className="form-product"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
          >
            <div className="form-content">
              <label htmlFor="nama_menu">Nama Product</label>
              <input
                type="text"
                onChange={handleChange}
                id="nama_menu"
                name="nama_menu"
              />
            </div>
            <div className="form-content">
              <label htmlFor="jenis_menu">Jenis</label>
              <select onChange={handleChange} id="jenis_menu" name="jenis_menu">
                <option value="" disabled selected>
                  Pilih Jenis Menu
                </option>
                <option value="makanan">Makanan</option>
                <option value="minuman">Minuman</option>
              </select>
            </div>
            <div className="form-content">
              <label htmlFor="harga_menu">Harga</label>
              <input
                type="number"
                onChange={handleChange}
                id="harga_menu"
                name="harga_menu"
              />
            </div>
            <div className="form-content">
              <label htmlFor="stock_menu">Stock</label>
              <input
                type="number"
                onChange={handleChange}
                id="stock_menu"
                name="stock_menu"
              />
            </div>
            <div className="form-content">
              <label htmlFor="description">Description</label>
              <textarea
                onChange={handleChange}
                id="description"
                name="description"
              ></textarea>
            </div>
            <div className="form-content">
              <label htmlFor="image">Image</label>
              <input
                type="file"
                onChange={handleChange}
                id="image"
                name="image"
              />
            </div>
            <div className="form-content">
              <div className="container-img">
                <img src={selectedImage} alt="choose image" />
              </div>
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
