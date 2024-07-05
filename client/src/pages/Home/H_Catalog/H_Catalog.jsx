import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import GetData from "../../../helper/GetData";
import axios from "axios";

export default function H_Menu() {
  axios.defaults.withCredentials = true;

  const { getToken } = GetData();
  const [foods, setFoods] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (getToken) {
      const objectToken = JSON.parse(getToken);
      setToken(objectToken.token);
    }
  }, []);

  useEffect(() => {
    axios
      .get("https://pempek-joli-server.vercel.app/api/product/makanan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const filteredData = [res.data[0], res.data[1], res.data[2]];
        setFoods(filteredData);
      })
      .catch((errors) => {
        console.error(errors);
      });
  }, [token]);

  const memoizedImages = useMemo(() => {
    const createImageUrls = (items) =>
      items.map(
        ({ img_menu }) =>
          `https://nyhsxdvwnltrriyylvyl.supabase.co/storage/v1/object/public/payments-image/products/${img_menu}`
      );

    return createImageUrls(foods);
  }, [foods]);

  return (
    <>
      <div className="h-catalog">
        <div className="note">Choose your Flavor</div>
        <div className="title">Food that brings people together!</div>
        <div className="description">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Molestiae
          iste dignissimos non laborum perspiciatis dicta.
        </div>
        <Link to="/menu" className="button">
          View All Menu
        </Link>
        <div className="sample">
          {foods.map((data, index) => {
            return (
              <div className="image" key={data._id}>
                <img src={memoizedImages[index]} alt={data.name} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
