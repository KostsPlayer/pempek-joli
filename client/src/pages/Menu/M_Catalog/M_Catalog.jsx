import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import GetData from "../../../helper/GetData";

export default function M_Catalog() {
  axios.defaults.withCredentials = true;

  const { getToken } = GetData();

  const [foods, setFoods] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (getToken) {
      const objectToken = JSON.parse(getToken);
      setToken(objectToken.token);
    }
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/product/makanan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setFoods(res.data);
        console.log(res.data);
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
  return (
    <>
      <div className="m-catalog">
        <div className="m-catalog-title">Makanan</div>
        <div className="m-catalog-content">
          {foods.map((data, index) => {
            return (
              <div className="container" key={data._id}>
                <div className="image">
                  <img src={memoizedImages[index]} alt={data.nama_menu} />
                </div>
                <div className="name">{data.nama_menu}</div>
                <div className="description">{data.description}</div>
                <div className="price">{formatPrice(data.harga_menu)}</div>
              </div>
            );
          })}
        </div>
        <div className="m-catalog-title">Minuman</div>
        <div className="m-catalog-content">
          {drinks.map((data, index) => {
            return (
              <div className="container" key={data._id}>
                <div className="image">
                  <img
                    src={memoizedImages[index + foods.length]}
                    alt={data.nama_menu}
                  />
                </div>
                <div className="name">{data.nama_menu}</div>
                <div className="description">{data.description}</div>
                <div className="price">{formatPrice(data.harga_menu)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
