import React, { useState, useEffect, useMemo, useCallback } from "react";
import Loader from "../../helper/Loader";
import Layout from "../../component/Layout/Layout";
import CreateStore from "./CreateStore";
import UpdateStore from "./UpdateStore";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import GetData from "../../helper/GetData";
import AlertMessage from "../../helper/AlertMessage";
import { ToastContainer } from "react-toastify";

export default function Store() {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const location = useLocation();

  const { toastMessage } = AlertMessage();

  const { getToken } = GetData();
  const objectToken = JSON.parse(getToken);
  const token = objectToken.token;

  const [products, setProducts] = useState({ foods: [], drinks: [] });
  const [productId, setProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
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
  }, [token, toastMessage]);

  useEffect(() => {
    if (token) {
      getProductData();
    }
  }, [token]);

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

  const formatPrice = (price) => {
    const priceInDecimal =
      typeof price === "object" && price.$numberDecimal
        ? parseFloat(price.$numberDecimal)
        : typeof price === "number"
        ? price
        : NaN;

    if (isNaN(priceInDecimal)) throw new Error("Invalid price format");

    const priceInRupiah = priceInDecimal * 1000;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(priceInRupiah);
  };

  const handleDeleteProduct = useCallback(
    (id) => {
      axios
        .delete(`https://pempek-joli-server.vercel.app/api/product/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          toastMessage("success", "Delete product successfully!");
          getProductData();
        })
        .catch((errors) => console.error(errors));
    },
    [token, toastMessage, getProductData]
  );

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Layout>
            <div className="store">
              <div className="new-product">
                <button
                  onClick={() => {
                    setOpenCreateModal(true);
                  }}
                >
                  New Product
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
              </div>
              <div className="store-wrapper">
                <div className="foods">
                  <div className="title">Makanan</div>
                  <div className="container">
                    {products.foods.map((data, index) => {
                      return (
                        <div className="item" key={data._id}>
                          <div className="image">
                            <img
                              src={memoizedImages.foods[index]}
                              alt={data.nama_menu}
                            />
                          </div>
                          <div className="name">{data.nama_menu}</div>
                          <div className="description">{data.description}</div>
                          <div className="stock">
                            Stock: <span>{data.stock_menu}</span>
                          </div>
                          <div className="price">
                            {formatPrice(data.harga_menu)}
                          </div>
                          <div className="action">
                            <span
                              className="material-symbols-outlined"
                              onClick={() => {
                                setOpenUpdateModal(true);
                                setProductId(data._id);
                              }}
                            >
                              edit
                            </span>
                            <span
                              className="material-symbols-outlined"
                              onClick={() => handleDeleteProduct(data._id)}
                            >
                              delete
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="drinks">
                  <div className="title">Minuman</div>
                  <div className="container">
                    {products.drinks.map((data, index) => {
                      return (
                        <div className="item" key={data._id}>
                          <div className="image">
                            <img
                              src={memoizedImages.drinks[index]}
                              alt={data.nama_menu}
                            />
                          </div>
                          <div className="name">{data.nama_menu}</div>
                          <div className="stock">
                            Stock: <span>{data.stock_menu}</span>
                          </div>
                          <div className="description">{data.description}</div>
                          <div className="price">
                            {formatPrice(data.harga_menu)}
                          </div>
                          <div className="action">
                            <span
                              className="material-symbols-outlined"
                              onClick={() => {
                                setOpenUpdateModal(true);
                                setProductId(data._id);
                              }}
                            >
                              edit
                            </span>
                            <span
                              className="material-symbols-outlined"
                              onClick={() => handleDeleteProduct(data._id)}
                            >
                              delete
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Layout>
          <CreateStore
            onOpen={openCreateModal}
            onClose={() => {
              setOpenCreateModal(false);
            }}
            refreshData={getProductData}
          />
          <UpdateStore
            onOpen={openUpdateModal}
            onClose={() => {
              setOpenUpdateModal(false);
            }}
            refreshData={getProductData}
            productId={productId}
          />
          <ToastContainer />
        </>
      )}
    </>
  );
}
