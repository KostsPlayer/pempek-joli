import React, { useState, useEffect, useMemo } from "react";
import Loader from "../../helper/Loader";
import Cursor from "../../helper/Cursor";
import SmoothScroll from "../../helper/SmoothScroll";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import GetData from "../../helper/GetData";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AlertMessage from "../../helper/AlertMessage";
import { ToastContainer } from "react-toastify";

export default function Order() {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const { getToken } = GetData();
  const { toastMessage } = AlertMessage();

  const [foods, setFoods] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

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
        setFoods(res.data);
        const initialQuantities = res.data.reduce((acc, item) => {
          acc[item._id] = ""; // Initialize with an empty string
          return acc;
        }, {});
        setQuantities((prev) => ({ ...prev, ...initialQuantities }));
      })
      .catch((errors) => {
        console.error(errors);
      });

    axios
      .get("https://pempek-joli-server.vercel.app/api/product/minuman", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDrinks(res.data);
        const initialQuantities = res.data.reduce((acc, item) => {
          acc[item._id] = ""; // Initialize with an empty string
          return acc;
        }, {});
        setQuantities((prev) => ({ ...prev, ...initialQuantities }));
      })
      .catch((errors) => {
        console.error(errors);
      });
  }, []);

  const memoizedImages = useMemo(() => {
    const createImageUrls = (items) =>
      items.map(
        ({ img_menu }) =>
          `https://nyhsxdvwnltrriyylvyl.supabase.co/storage/v1/object/public/payments-image/products/${img_menu}`
      );

    return {
      foods: createImageUrls(foods),
      drinks: createImageUrls(drinks),
    };
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

  const AddQuantity = (id, stock) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] < stock ? (prev[id] === "" ? 1 : prev[id] + 1) : prev[id],
    }));
  };

  const RemoveQuantity = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 1 ? prev[id] - 1 : prev[id] === 1 ? "" : prev[id],
    }));
  };

  const handleQuantityChange = (id, value, stock) => {
    const newValue =
      value === "" ? "" : Math.max(0, Math.min(stock, Number(value)));
    setQuantities((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  const handleToCart = (e) => {
    if (token) {
      e.preventDefault();

      const products = [];
      for (const [productId, quantity] of Object.entries(quantities)) {
        if (quantity !== "") {
          products.push({
            id_product: productId,
            jumlah_product_cart: quantity,
          });
        }
      }

      axios
        .post(
          "https://pempek-joli-server.vercel.app/api/cart/",
          {
            products: products,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          // console.log(res.data);
          navigate("/cart", {
            state: { messageToCart: "Item successfully added to cart!" },
          });
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      toastMessage("info", "Please login first");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Cursor />
          <SmoothScroll />
          <div className="order">
            <div className="order-foods">
              <Navbar />
              <div className="content">
                <div className="title">Makanan</div>
                <div className="list">
                  {foods.map((data, index) => {
                    return (
                      <div className="item" key={data._id}>
                        <div className="item-image">
                          <img
                            src={memoizedImages.foods[index]}
                            alt={data.nama_menu}
                          />
                        </div>
                        <div className="item-title">{data.nama_menu}</div>
                        <div className="item-price">
                          {formatPrice(data.harga_menu)}
                        </div>
                        <div className="item-stock">
                          Stock: {data.stock_menu}
                        </div>
                        <div className="item-action">
                          <span
                            className="material-symbols-outlined"
                            onClick={() => RemoveQuantity(data._id)}
                          >
                            remove
                          </span>
                          <input
                            type="number"
                            name="quantity"
                            value={quantities[data._id]}
                            onChange={(e) =>
                              handleQuantityChange(
                                data._id,
                                e.target.value,
                                data.stock_menu
                              )
                            }
                            min="0"
                            max={data.stock_menu}
                          />
                          <span
                            className="material-symbols-outlined"
                            onClick={() =>
                              AddQuantity(data._id, data.stock_menu)
                            }
                          >
                            add
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="order-drinks">
              <div className="title">Minuman</div>
              <div className="list">
                {drinks.map((data, index) => {
                  return (
                    <div className="item" key={data._id}>
                      <div className="item-image">
                        <img
                          src={memoizedImages.drinks[index]}
                          alt={data.nama_menu}
                        />
                      </div>
                      <div className="item-title">{data.nama_menu}</div>
                      <div className="item-price">
                        {formatPrice(data.harga_menu)}
                      </div>
                      <div className="item-stock">Stock: {data.stock_menu}</div>
                      <div className="item-action">
                        <span
                          className="material-symbols-outlined"
                          onClick={() => RemoveQuantity(data._id)}
                        >
                          remove
                        </span>
                        <input
                          type="number"
                          name="quantity"
                          value={quantities[data._id]}
                          onChange={(e) =>
                            handleQuantityChange(
                              data._id,
                              e.target.value,
                              data.stock_menu
                            )
                          }
                          min="0"
                          max={data.stock_menu}
                        />
                        <span
                          className="material-symbols-outlined"
                          onClick={() => AddQuantity(data._id, data.stock_menu)}
                        >
                          add
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="add-to-cart" onClick={handleToCart}>
              <span className="material-symbols-outlined">draft_orders</span>
              <span>Add to cart!</span>
            </div>
          </div>
          <Footer />
        </>
      )}
      <ToastContainer />
    </>
  );
}
