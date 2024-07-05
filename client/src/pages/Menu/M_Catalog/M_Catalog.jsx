import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import GetData from "../../../helper/GetData";

export default function M_Catalog() {
  axios.defaults.withCredentials = true;

  const { getToken } = GetData();

  const [products, setProducts] = useState({
    foods: [],
    drinks: [],
  });
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (getToken) {
      const objectToken = JSON.parse(getToken);
      setToken(objectToken.token);
    }
  }, []);

  const getProductData = useCallback(() => {
    const fetchFoods = axios.get(
      "https://pempek-joli-server.vercel.app/api/product/makanan",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const fetchDrinks = axios.get(
      "https://pempek-joli-server.vercel.app/api/product/minuman",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    Promise.all([fetchFoods, fetchDrinks])
      .then(([foodsResponse, drinksResponse]) => {
        setProducts({
          foods: foodsResponse.data,
          drinks: drinksResponse.data,
        });
      })
      .catch((errors) => {
        console.error(errors);
      });
  }, [token]);

  useEffect(() => {
    getProductData();

    console.log(products.foods);
    console.log(products.drinks);
  }, [token, getProductData, products]);

  const memoizedImages = useMemo(() => {
    const createImageUrls = (items) =>
      items.map(
        ({ img_menu }) =>
          `https://nyhsxdvwnltrriyylvyl.supabase.co/storage/v1/object/public/payments-image/products/${img_menu}`
      );

    return {
      foods: createImageUrls(products.foods),
      drinks: createImageUrls(products.drinks),
    };
  }, [products]);

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
          {products.foods.map((data, index) => {
            return (
              <div className="container" key={data._id}>
                <div className="image">
                  <img src={memoizedImages.foods[index]} alt={data.nama_menu} />
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
          {products.drinks.map((data, index) => {
            return (
              <div className="container" key={data._id}>
                <div className="image">
                  <img src={memoizedImages.drinks[index]} alt={data.nama_menu} />
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
