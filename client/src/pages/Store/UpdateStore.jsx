import React, { useState, useEffect } from "react";
import axios from "axios";
import AlertMessage from "../../helper/AlertMessage";
import { ToastContainer } from "react-toastify";
import GetData from "../../helper/GetData";

export default function UpdateStore({ onOpen, onClose }) {
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
    image: null, // Perbaikan di sini
  });
  const [foods, setFoods] = useState([]);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5000/makanan", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setFoods(res.data);
        })
        .catch((errors) => {
          console.error(errors);
        });
    }
  }, [token]);

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setValues({ ...values, [e.target.name]: e.target.files[0] }); // Perbaikan di sini
      setFileName(e.target.files[0].name);
    } else {
      if (
        (e.target.name === "harga_menu" || e.target.name === "stock_menu") &&
        parseFloat(e.target.value) < 0
      ) {
        return toastMessage("error", "Cannot be negative");
      }
      setValues({ ...values, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nama_menu", values.nama_menu);
    formData.append("jenis_menu", values.jenis_menu);
    formData.append("harga_menu", values.harga_menu);
    formData.append("stock_menu", values.stock_menu);
    formData.append("description", values.description);
    formData.append("image", values.image); // Perbaikan di sini

    // Log FormData to console
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    if (token) {
      axios
        .post("http://localhost:5000/api/product/makanan", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((errors) => {
          console.error(errors);
        });
    }
  };

  return (
    <>
      <div className="overlay-modal" onClick={onClose}>
        <div
          className="modal-area"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <span className="title">Update Modal</span>
          <span className="material-symbols-outlined" onClick={onClose}>
            cancel
          </span>
          <form
            className="form-product"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
          >
            {foods.map((data, index) => {
              return (
                <>
                  <div className="form-content">
                    <label htmlFor="nama_menu">Nama Product</label>
                    <input
                      type="text"
                      onChange={handleChange}
                      id="nama_menu"
                      name="nama_menu"
                      value={data.nama_menu}
                    />
                  </div>
                  <div className="form-content">
                    <label htmlFor="jenis_menu">Jenis</label>
                    <select
                      onChange={handleChange}
                      id="jenis_menu"
                      name="jenis_menu"
                    >
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
                      value={data.harga_menu}
                    />
                  </div>
                  <div className="form-content">
                    <label htmlFor="stock_menu">Stock</label>
                    <input
                      type="number"
                      onChange={handleChange}
                      id="stock_menu"
                      name="stock_menu"
                      value={data.stock_menu}
                    />
                  </div>
                  <div className="form-content">
                    <label htmlFor="description">Description</label>
                    <textarea
                      onChange={handleChange}
                      id="description"
                      name="description"
                      value={data.description}
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
                  <button type="submit">Submit</button>
                </>
              );
            })}
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
