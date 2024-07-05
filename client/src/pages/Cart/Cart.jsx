import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../helper/Loader";
import Cursor from "../../helper/Cursor";
import SmoothScroll from "../../helper/SmoothScroll";
import Blabar from "../../component/Blabar/Blabar";
import GetData from "../../helper/GetData";
import axios from "axios";
import AlertMessage from "../../helper/AlertMessage";
import { ToastContainer } from "react-toastify";
import Receipt from "./Component/Receipt";
import Summary from "./Component/Summary";
import Item from "./Component/Item";
import { useJsApiLoader } from "@react-google-maps/api";

const libraries = ["places"];
const origin =
  "Universitas Logistik dan Bisnis Internasional (ULBI), Jl. Sariasih, Sarijadi, Bandung City, West Java, Indonesia";

export default function Cart() {
  axios.defaults.withCredentials = true;

  const { toastMessage } = AlertMessage();
  const location = useLocation();
  const navigate = useNavigate();

  const { getToken } = GetData();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cartData, setCartData] = useState([]);
  const [productCartData, setProductCartData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [products, setProducts] = useState([]);
  const [costProducts, setCostProduct] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [originalQuantities, setOriginalQuantities] = useState({});
  const [payments, setPayments] = useState([]);
  const [openPayments, setOpenPayments] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [address, setAddress] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [openReceipt, setOpenReceipt] = useState(false);
  const [paymentPending, setPaymentPending] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [distance, setDistance] = useState(null);
  const [costDistance, setCostDistance] = useState(0);
  const [paymentId, setPaymentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (getToken) {
      const objectToken = JSON.parse(getToken);
      setToken(objectToken.token);
    }
  }, [getToken]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (location.state?.messageToCart) {
      console.log(location.state.messageToCart);
      toastMessage("success", location.state.messageToCart);
      navigate(location.pathname, {
        state: { ...location.state, messageToCart: undefined },
        replace: true,
      });
    }
  }, [location.state, location.pathname, navigate, toastMessage]);

  const reconstructArray = useCallback((params) => {
    return params.reduce((acc, item) => {
      const { groupIndex, ...rest } = item;
      if (!acc[groupIndex]) {
        acc[groupIndex] = [];
      }
      acc[groupIndex].push(rest);
      return acc;
    }, []);
  }, []);

  const refreshDataCart = useCallback(() => {
    axios
      .get("https://pempek-joli-server.vercel.app/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = res.data.data;
        setCartData(data);

        const allProducts = data.reduce((acc, curr, index) => {
          const products = curr.products
            .filter((item) => item.status_final === "false")
            .map((product) => ({
              ...product,
              groupIndex: index,
            }));
          return acc.concat(products);
        }, []);

        setProductCartData(allProducts);

        // Initialize original quantities
        const origQuantities = {};
        data.forEach((cart) => {
          cart.products.forEach((product) => {
            if (!origQuantities[product.id_product]) {
              origQuantities[product.id_product] = [];
            }
            origQuantities[product.id_product].push({
              cartId: cart._id,
              quantity: product.jumlah_product_cart,
            });
          });
        });
        setOriginalQuantities(origQuantities);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshDataCart();
    }
  }, [token, refreshDataCart]);

  useEffect(() => {
    if (cartData.length > 0) {
      setQuantities(
        productCartData.reduce((acc, data) => {
          acc[data.id_product] =
            (acc[data.id_product] || 0) + data.jumlah_product_cart;
          return acc;
        }, {})
      );
    }
  }, [cartData, productCartData]);

  useEffect(() => {
    const fetchProducts = () => {
      Promise.all(
        Object.keys(quantities).map((id) =>
          axios
            .get(
              `https://pempek-joli-server.vercel.app/api/product/cari/${id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            .then((res) => res.data.data)
        )
      )
        .then((productCartData) => {
          setProducts(productCartData.filter((item) => item));
        })
        .catch((err) => {
          console.error(err);
        });
    };
    if (Object.keys(quantities).length > 0) fetchProducts();
  }, [quantities, token]);

  useEffect(() => {
    if (token) {
      axios
        .get("https://pempek-joli-server.vercel.app/api/order", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const dataOrder = res.data.data;
          const paymentIdArray = dataOrder.map((item) => item.id_pembayaran);

          const sendPaymentId = paymentIdArray[paymentIdArray.length - 1];
          setPaymentId(sendPaymentId);

          if (sendPaymentId.length > 0) {
            axios
              .get(
                `https://pempek-joli-server.vercel.app/api/payments/${sendPaymentId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then((res) => {
                const dataPayment = res.data.data;
                const statusPayment = dataPayment.payment.status_pembayaran;

                setPaymentPending(statusPayment);
              })
              .catch((err) => {
                console.error(err);
              });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [token]);

  const checkout = useCallback(() => {
    const totalQuantities = Object.keys(originalQuantities).reduce(
      (acc, productId) => {
        const total = originalQuantities[productId].reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        acc[productId] = total;
        return acc;
      },
      {}
    );

    const updatedQuantities = { ...quantities };
    const reconstructedProducts = reconstructArray(productCartData);

    reconstructedProducts.forEach((group, index) => {
      group.forEach((item) => {
        const originalQtys = originalQuantities[item.id_product];
        if (originalQtys) {
          const totalOriginalQty = totalQuantities[item.id_product];
          const newQty = updatedQuantities[item.id_product];
          originalQtys.forEach((orig) => {
            const proportion = orig.quantity / totalOriginalQty;
            orig.newQuantity = Math.round(newQty * proportion);
          });
        }
      });
    });

    const updateCartPromises = cartData.map((cart, index) => {
      const productsInCart = reconstructedProducts[index] || [];
      const id_product = productsInCart.map((item) => item.id_product);
      const jumlah_product_cart = productsInCart.map((item) => {
        const origQtys = originalQuantities[item.id_product];
        if (origQtys) {
          const cartQty = origQtys.find(
            (orig) => orig.cartId === cart._id
          )?.newQuantity;
          return cartQty || item.jumlah_product_cart || 0; // Pastikan ada nilai default
        }
        return item.jumlah_product_cart || 0; // Pastikan ada nilai default
      });

      const payload = {
        id_product,
        jumlah_product_cart,
      };

      console.log("product Cart", productCartData);

      return axios.put(
        `https://pempek-joli-server.vercel.app/api/cart/update/${cart._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    });

    Promise.all(updateCartPromises)
      .then((updateResponses) => {
        const successMessage = updateResponses[0]?.data?.message;
        if (successMessage) {
          toastMessage("success", successMessage);
        }
        refreshDataCart();

        const detail_pesanan = productCartData
          .filter((item) => item.isActive === "true")
          .map((item) => {
            const foundProduct = products.find(
              (prod) => prod._id === item.id_product
            );

            // const quantity = item.jumlah_product_cart;
            const quantity = quantities[item.id_product] || 0;
            const price = foundProduct
              ? parseFloat(foundProduct.harga_menu.$numberDecimal)
              : null;

            return {
              id_product: item.id_product,
              jumlah: quantity,
              total_harga: price * quantity,
            };
          });

        const payloadCreateOrder = {
          id_MetodePembayaran: paymentMethod.payment,
          id_alamat_pengiriman: selectedAddress,
          detail_pesanan: detail_pesanan,
          total_harga: totalAmount,
        };

        return axios.post(
          "https://pempek-joli-server.vercel.app/api/order",
          payloadCreateOrder,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      })
      .catch((updateError) => {
        console.error(updateError);
        console.error(updateError.response?.data);
        toastMessage("error", updateError.response?.data.error);
      })
      .then((createOrderResponse) => {
        if (createOrderResponse) {
          const successMessage = createOrderResponse.data.message;
          if (successMessage) {
            toastMessage("success", successMessage);
          }
        }
      })
      .catch((createOrderError) => {
        toastMessage("error", createOrderError.response?.data.error);
        console.error(createOrderError);
        console.error(createOrderError.response?.data);
      });
  }, [
    cartData,
    originalQuantities,
    productCartData,
    quantities,
    token,
    paymentMethod,
    selectedAddress,
    totalAmount,
    products,
    reconstructArray,
    refreshDataCart,
    toastMessage,
  ]);

  const toggleActive = useCallback(
    (id) => {
      const product = productCartData.find((item) => item.id_product === id);
      if (product) {
        const currentStatus = JSON.parse(product.isActive);
        const newActiveStatus = !currentStatus;

        // Cari semua cart yang mengandung produk dengan id yang sama
        const cartsContainingProduct = cartData.filter((cart) =>
          cart.products.some((prod) => prod.id_product === id)
        );

        // Update status aktif untuk setiap cart yang ditemukan
        const updatePromises = cartsContainingProduct.map((cart) =>
          axios.put(
            `https://pempek-joli-server.vercel.app/api/cart/${cart._id}/product/status`,
            {
              id_product: id,
              isActive: newActiveStatus,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        );

        Promise.all(updatePromises)
          .then((responses) => {
            // Perbarui state untuk semua entri dengan id_product yang sama
            setProductCartData((prev) =>
              prev.map((item) =>
                item.id_product === id
                  ? { ...item, isActive: newActiveStatus.toString() }
                  : item
              )
            );
            refreshDataCart();
            toastMessage("success", "Status berhasil diperbarui");
          })
          .catch((err) => {
            console.error("Error:", err);
          });
      }
    },
    [cartData, productCartData, refreshDataCart, token, toastMessage]
  );

  const AddQuantity = useCallback((id, stock) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] < stock ? (prev[id] === "" ? 1 : prev[id] + 1) : prev[id],
    }));
  }, []);

  const RemoveQuantity = useCallback((id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 1 ? prev[id] - 1 : prev[id] === 1 ? "" : prev[id],
    }));
  }, []);

  const handleQuantityChange = useCallback((id, value, stock) => {
    const newValue =
      value === "" ? "" : Math.max(0, Math.min(stock, Number(value)));
    setQuantities((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  }, []);

  const memoizedImages = useMemo(() => {
    const productImages = products.map(
      ({ img_menu }) => `./products/${img_menu}`
    );

    return productImages;
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

  useEffect(() => {
    let total = 0;

    const activeProductIds = productCartData
      .filter((item) => item.isActive === "true")
      .map((item) => item.id_product);

    // Hitung total harga untuk produk yang aktif
    products.forEach((item) => {
      if (activeProductIds.includes(item._id)) {
        const quantity = quantities[item._id] || 0;
        total += quantity * parseFloat(item.harga_menu.$numberDecimal);
      }
    });

    setCostProduct(total);
  }, [products, quantities, productCartData]);

  const deleteProduct = useCallback(
    (id) => {
      const updatedProductData = productCartData.filter(
        (item) => item.id_product !== id
      );
      const updatedQuantities = { ...quantities };
      delete updatedQuantities[id];

      setProductCartData(updatedProductData);
      setQuantities(updatedQuantities);

      const cartId = cartData.find((cart) =>
        cart.products.some((prod) => prod.id_product === id)
      )?._id;

      axios
        .delete(
          `https://pempek-joli-server.vercel.app/api/cart/${cartId}/product`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { id_product: id },
          }
        )
        .then((res) => {
          toastMessage("success", "Delete product in cart successfully!");
          refreshDataCart();
        })
        .catch((err) => {
          console.error("Error:", err);
        });
    },
    [cartData, productCartData, quantities, token, toastMessage]
  );

  const deleteCart = useCallback(() => {
    axios
      .delete(`https://pempek-joli-server.vercel.app/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toastMessage("success", res.data.message);

        refreshDataCart();
      })
      .catch((err) => {
        console.error(err);
      });
  }, [token, refreshDataCart]);

  useEffect(() => {
    if (token) {
      axios
        .get("https://pempek-joli-server.vercel.app/api/payments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setPayments(res.data.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [token]);

  const lengthAllProduct = productCartData.reduce((acc, current) => {
    if (!acc.some((item) => item.id_product === current.id_product)) {
      acc.push(current);
    }
    return acc;
  }, []);

  useEffect(() => {
    if (token) {
      axios
        .get(
          "https://pempek-joli-server.vercel.app/api/alamatpengiriman/alamat",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setAddress(res.data.alamat);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [token]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (selectedAddress) {
      if (!isLoaded || !window.google) {
        return;
      }

      const directionsService = new window.google.maps.DirectionsService();

      const getRoute = async () => {
        try {
          const result = await directionsService.route({
            origin: origin,
            destination: selectedDestination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          });

          if (result.routes && result.routes.length > 0) {
            setDistance(result.routes[0].legs[0].distance.text);
          } else {
            toastMessage("error", "No routes found");
          }
        } catch (error) {
          if (error.code === "ZERO_RESULTS") {
            toastMessage(
              "error",
              "No route could be found between the origin and destination."
            );
          } else {
            toastMessage(
              "error",
              "An error occurred while calculating the route."
            );
          }
        }
      };

      getRoute();
    }
  }, [isLoaded, origin, selectedDestination, selectedAddress]);

  useEffect(() => {
    if (distance) {
      const pertaliteCost = (10 * 110) / 100;
      const maxPertaliteDistance = 15;
      const costPerKm = pertaliteCost / maxPertaliteDistance;

      const distanceValue = parseFloat(distance.replace(" km", ""));
      const totalCostDistance = distanceValue * costPerKm * 2;

      setCostDistance(totalCostDistance.toFixed(0));
    }
  }, [distance]);

  useEffect(() => {
    const calculatedTotalAmount = costProducts + parseFloat(costDistance);

    setTotalAmount(calculatedTotalAmount);
  }, [costProducts, costDistance]);

  if (!isLoaded) {
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
          <Blabar nonBorder={true} />
          <Receipt
            onOpen={openReceipt}
            onClose={() => {
              setOpenReceipt(false);
            }}
            token={token}
            paymentId={paymentId}
          />
          <div className="cart">
            <Item
              productCartData={productCartData}
              lengthAllProduct={lengthAllProduct}
              deleteCart={deleteCart}
              products={products}
              toggleActive={toggleActive}
              memoizedImages={memoizedImages}
              RemoveQuantity={RemoveQuantity}
              quantities={quantities}
              handleQuantityChange={handleQuantityChange}
              AddQuantity={AddQuantity}
              formatPrice={formatPrice}
              deleteProduct={deleteProduct}
            />
            <Summary
              lengthAllProduct={lengthAllProduct}
              formatPrice={formatPrice}
              costProducts={costProducts}
              setPaymentMethod={setPaymentMethod}
              address={address}
              payments={payments}
              setSelectedAddress={setSelectedAddress}
              openPayments={openPayments}
              setOpenPayments={setOpenPayments}
              selectedPayment={selectedPayment}
              setSelectedPayment={setSelectedPayment}
              totalAmount={totalAmount}
              checkout={checkout}
              setSelectedDestination={setSelectedDestination}
              costDistance={costDistance}
            />
            {paymentPending === "Pending" ? (
              <div
                className="cart-receipt"
                onClick={() => {
                  setOpenReceipt(true);
                }}
              >
                <span className="material-symbols-outlined">receipt_long</span>
                <span>Send Receipt</span>
              </div>
            ) : (
              ""
            )}
          </div>
        </>
      )}
      <ToastContainer />
    </>
  );
}
