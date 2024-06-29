import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import AlertMessage from "../../helper/AlertMessage";
import { ToastContainer } from "react-toastify";
import GetData from "../../helper/GetData";

export default function CreateStore({ onOpen, onClose, refreshData, message }) {
  axios.defaults.withCredentials = true;
  if (!onOpen) return null;

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
    img_menu: null, // Perbaikan di sini
  });

  const handleChange = useCallback(
    (e) => {
      const { name, type, value, files } = e.target;
      setValues((prevValues) => {
        if (type === "file") {
          return { ...prevValues, [name]: files[0] };
        } else {
          if (
            (name === "harga_menu" || name === "stock_menu") &&
            parseFloat(value) < 0
          ) {
            toastMessage("error", "Cannot be negative");
            return prevValues; // Tidak mengubah state jika nilai negatif
          }
          return { ...prevValues, [name]: value };
        }
      });
    },
    [toastMessage]
  );

  useEffect(() => {
    console.log(values);
  }, [values]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("nama_menu", values.nama_menu);
      formData.append("jenis_menu", values.jenis_menu);
      formData.append("harga_menu", values.harga_menu);
      formData.append("stock_menu", values.stock_menu);
      formData.append("description", values.description);
      formData.append("img_menu", values.img_menu); // Perbaikan di sini

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      if (token) {
        axios
          .post("https://pempek-joli-server.vercel.app/api/product", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            message(res.data.message);
            onClose();
            refreshData();
            // console.log(res.data);
          })
          .catch((errors) => {
            console.error(errors);
          });
      }
    },
    [token, refreshData, onClose, message]
  );

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
              <label htmlFor="img_menu">Image</label>
              <input
                type="file"
                onChange={handleChange}
                id="img_menu"
                name="img_menu"
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
