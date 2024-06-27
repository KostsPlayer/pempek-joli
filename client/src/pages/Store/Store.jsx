import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../component/Layout/Layout";
import CreateStore from "./CreateStore";
import UpdateStore from "./UpdateStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GetData from "../../helper/GetData";

export default function Store() {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const { getToken } = GetData();
  const objectToken = JSON.parse(getToken);
  const token = objectToken.token;

  const [foods, setFoods] = useState([]);
  const [drinks, setDrinks] = useState([]);

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5000/api/product/makanan", {
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

      axios
        .get("http://localhost:5000/api/product/minuman", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setDrinks(res.data);
        })
        .catch((errors) => {
          console.error(errors);
        });
    }
  }, [token]);

  const memoizedImages = useMemo(() => {
    const foodImages = foods.map(({ img_menu }) => `./products/${img_menu}`);
    const drinkImages = drinks.map(({ img_menu }) => `./products/${img_menu}`);
    return [...foodImages, ...drinkImages];
  }, [foods, drinks]);

  const formatPrice = (priceObj) => {
    const priceString = priceObj.$numberDecimal;
    const priceInDecimal = parseFloat(priceString);
    const priceInRupiah = priceInDecimal * 1000;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(priceInRupiah);
  };

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  return (
    <>
      <CreateStore
        onOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
        }}
      />
      <UpdateStore
        onOpen={openUpdateModal}
        onClose={() => {
          setOpenUpdateModal(false);
        }}
      />
      <Layout>
        <div className="store">
          <div className="store-new-product">
            <button
              onClick={() => {
                setOpenCreateModal(true);
              }}
            >
              New Product
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <button
              onClick={() => {
                setOpenUpdateModal(true);
              }}
            >
              Update
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
          <div className="store-title">Makanan</div>
          <div className="store-container">
            {foods.map((data, index) => {
              return (
                <div className="item" key={data._id}>
                  <div className="image">
                    <img src={memoizedImages[index]} alt={data.nama_menu} />
                  </div>
                  <div className="name">{data.nama_menu}</div>
                  <div className="description">{data.description}</div>
                  <div className="stock">
                    Stock: <span>{data.stock_menu}</span>
                  </div>
                  <div className="price">{formatPrice(data.harga_menu)}</div>
                </div>
              );
            })}
          </div>
          <div className="store-title">Minuman</div>
          <div className="store-container">
            {drinks.map((data, index) => {
              return (
                <div className="item" key={data._id}>
                  <div className="image">
                    <img
                      src={memoizedImages[index + foods.length]}
                      alt={data.nama_menu}
                    />
                  </div>
                  <div className="name">{data.nama_menu}</div>
                  <div className="stock">
                    Stock: <span>{data.stock_menu}</span>
                  </div>
                  <div className="description">{data.description}</div>
                  <div className="price">{formatPrice(data.harga_menu)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Layout>
    </>
  );
}
