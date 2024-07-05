import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AlertMessage from "../../helper/AlertMessage";
import { ToastContainer } from "react-toastify";
import GetData from "../../helper/GetData";

export default function UpdateStore({
  onOpen,
  onClose,
  productId,
  refreshData,
}) {
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
    img_menu: "",
    image: null,
  });
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (token) {
      axios
        .get(
          `https://pempek-joli-server.vercel.app/api/product/cari/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          console.log(res.data.data);
          // Set values here to update form fields
          setValues({
            nama_menu: res.data.data.nama_menu,
            jenis_menu: res.data.data.jenis_menu,
            harga_menu: parseFloat(
              res.data.data.harga_menu?.$numberDecimal || 0
            ),
            stock_menu: res.data.data.stock_menu,
            description: res.data.data.description,
            img_menu: res.data.data.img_menu,
            image: null,
          });
        })
        .catch((errors) => {
          console.error(errors);
        });
    }
  }, [token, productId]);

  useEffect(() => {
    if (values.img_menu) {
      setSelectedImage(
        `https://nyhsxdvwnltrriyylvyl.supabase.co/storage/v1/object/public/payments-image/products/${values.img_menu}`
      );
    }
  }, [values.img_menu]);

  useEffect(() => {
    console.log(values.img_menu);
    console.log(selectedImage);
  }, [selectedImage, values]);

  const handleImageChange = useCallback(
    (e) => {
      const file = e.target.files[0];

      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        setValues((prevValues) => ({ ...prevValues, image: file }));
      }
    },
    [setSelectedImage, setValues]
  );

  const handleChange = useCallback(
    (e) => {
      if (e.target.type === "file") {
        handleImageChange(e);
      } else {
        if (
          (e.target.name === "harga_menu" || e.target.name === "stock_menu") &&
          e.target.value < 0
        ) {
          toastMessage("error", "Cannot be negative");
        } else {
          setValues((prevValues) => ({
            ...prevValues,
            [e.target.name]: e.target.value,
          }));
        }
      }
    },
    [handleImageChange, toastMessage]
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
      if (values.image) {
        formData.append("img_menu", values.image);
      }

      axios
        .put(
          `https://pempek-joli-server.vercel.app/api/product/update/${productId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
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
    [values, token, toastMessage, onClose, refreshData, productId]
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
          <span className="title">Update Modal</span>
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
                value={values.nama_menu}
              />
            </div>
            <div className="form-content">
              <label htmlFor="jenis_menu">Jenis</label>
              <select
                onChange={handleChange}
                id="jenis_menu"
                name="jenis_menu"
                value={values.jenis_menu}
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
                value={values.harga_menu}
              />
            </div>
            <div className="form-content">
              <label htmlFor="stock_menu">Stock</label>
              <input
                type="number"
                onChange={handleChange}
                id="stock_menu"
                name="stock_menu"
                value={values.stock_menu}
              />
            </div>
            <div className="form-content">
              <label htmlFor="description">Description</label>
              <textarea
                onChange={handleChange}
                id="description"
                name="description"
                value={values.description}
              ></textarea>
            </div>
            <div className="form-content">
              <label htmlFor="image">Image</label>
              <input
                type="file"
                onChange={handleImageChange}
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
