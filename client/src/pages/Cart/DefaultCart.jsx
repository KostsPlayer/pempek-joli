import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cursor from "../../helper/Cursor";
import SmoothScroll from "../../helper/SmoothScroll";
import Blabar from "../../component/Blabar/Blabar";
import GetData from "../../helper/GetData";
import axios from "axios";
import AlertMessage from "../../helper/AlertMessage";
import { ToastContainer } from "react-toastify";
import Receipt from "./Component/Receipt";

export default function Cart() {
  axios.defaults.withCredentials = true;

  const { toastMessage } = AlertMessage();
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = GetData();
  const objectToken = JSON.parse(getToken);
  const token = objectToken.token;

  const [method, setMethod] = useState({
    collect: "",
    payment: 0,
  });
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
  const [orderPending, setOrderPending] = useState(0);

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
    if (token) refreshDataCart();
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
            .get(`https://pempek-joli-server.vercel.app/api/product/cari/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
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
          const data = res.data.data;
          const countOrderPending = data.filter(
            (item) => item.status_pesanan === "Pending"
          ).length;

          setOrderPending(countOrderPending);
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

        const payloadCreateOrder = {
          id_MetodePembayaran: method.payment,
          id_alamat_pengiriman: selectedAddress,
          metode_pengambilan: method.collect,
          detail_pesanan: productCartData
            .filter((item) => item.isActive === "true")
            .map((item) => ({
              id_product: item.id_product,
              Jumlah: item.jumlah_product_cart || 0, // Atau tambahkan nilai default jika undefined
            })),
        };

        console.log(payloadCreateOrder);

        return axios.post(
          "https://pempek-joli-server.vercel.app/api/order",
          payloadCreateOrder,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      })
      .catch((updateError) => {
        console.error("Error:", updateError);
        console.error(updateError.response?.data);
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
        console.error("Error:", createOrderError);
        console.error(createOrderError.response?.data);
      });
  }, [
    cartData,
    originalQuantities,
    productCartData,
    quantities,
    reconstructArray,
    refreshDataCart,
    token,
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

        // Tunggu semua permintaan selesai
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

  const serviceFee = 12;

  useEffect(() => {
    const calculatedTotalAmount =
      method.collect === "shipping" ? costProducts + serviceFee : costProducts;
    setTotalAmount(calculatedTotalAmount);
  }, [method.collect, costProducts]);

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
        .delete(`https://pempek-joli-server.vercel.app/api/cart/${cartId}/product`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { id_product: id },
        })
        .then((res) => {
          toastMessage("success", res.data.message);
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
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
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
  }, [token]);

  const lengthAllProduct = productCartData.reduce((acc, current) => {
    // Check if the current id_product is already in the accumulator
    if (!acc.some((item) => item.id_product === current.id_product)) {
      // If not, add the current item to the accumulator
      acc.push(current);
    }
    return acc;
  }, []);

  useEffect(() => {
    axios
      .get("https://pempek-joli-server.vercel.app/api/alamatpengiriman/alamat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAddress(res.data.alamat);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <>
      <Cursor />
      <SmoothScroll />
      <Blabar nonBorder={true} />
      <Receipt
        onOpen={openReceipt}
        onClose={() => {
          setOpenReceipt(false);
        }}
      />
      <div className="cart">
        <div className="cart-item">
          {productCartData.length > 0 ? (
            <>
              <div className="cart-item-title">
                <div className="text">Shopping Cart</div>
                <div className="service">
                  <div className="amount">{lengthAllProduct.length} items</div>
                  <span className="limit">|</span>
                  <span
                    className="material-symbols-outlined"
                    onClick={() => deleteCart()}
                  >
                    delete_sweep
                  </span>
                </div>
              </div>
              <div className="cart-item-list">
                {products.map((data, index) => {
                  const activeProduct = productCartData.find(
                    (item) => item.id_product === data._id
                  );
                  return (
                    <div className="product" key={data._id}>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={
                          activeProduct && activeProduct.isActive
                            ? JSON.parse(activeProduct.isActive)
                            : false
                        }
                        onChange={() => toggleActive(data._id)}
                      />
                      <div className="product-image">
                        <img src={memoizedImages[index]} alt={data.nama_menu} />
                      </div>
                      <div className="product-info">
                        <div className="category">{data.jenis_menu}</div>
                        <div className="name">{data.nama_menu}</div>
                      </div>
                      <div className="product-quantity">
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
                      <div className="product-price">
                        {formatPrice(data.harga_menu)}
                      </div>
                      <span
                        className="material-symbols-outlined close"
                        onClick={() => deleteProduct(data._id)}
                      >
                        cancel
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <span className="material-symbols-outlined off">
              shopping_cart_off
            </span>
          )}
        </div>
        <div className="cart-summary">
          <div className="cart-summary-title">Summary</div>
          <div className="total-item">
            <div className="text">
              {
                lengthAllProduct.filter((item) => item.isActive === "true")
                  .length
              }{" "}
              Items
            </div>
            <div className="amount">
              <span>{formatPrice(costProducts)}</span>
            </div>
          </div>
          <div className="collect">
            <div className="title">Collect Method(s)</div>
            <div className="item">
              <input
                type="radio"
                id="shipping"
                name="method"
                value="shipping"
                onChange={(e) => {
                  setMethod((prev) => ({
                    ...prev,
                    collect: e.target.value,
                  }));
                }}
              />
              <label htmlFor="shipping">Shipping</label>
            </div>
            <div className="item">
              <input
                type="radio"
                id="takeaway"
                name="method"
                value="takeaway"
                onChange={(e) => {
                  setMethod((prev) => ({
                    ...prev,
                    collect: e.target.value,
                  }));
                }}
              />
              <label htmlFor="takeaway">Take away</label>
            </div>
            <div className="item">
              <input
                type="radio"
                id="takeIn"
                name="method"
                value="takeIn"
                onChange={(e) => {
                  setMethod((prev) => ({
                    ...prev,
                    collect: e.target.value,
                  }));
                }}
              />
              <label htmlFor="takeIn">Take-in</label>
            </div>
          </div>
          {method.collect === "shipping" ? (
            <>
              <div className="shipping-method">
                <div className="service">
                  <div className="text">Service Fee</div>
                  <div className="amount">{formatPrice(12)}</div>
                </div>
              </div>
              <div className="address">
                <div className="title">Shipping Address</div>
                <div className="list">
                  {address.map((data) => (
                    <div className="item" key={data._id}>
                      <input
                        type="radio"
                        id="address"
                        name="address"
                        onChange={() => {
                          setSelectedAddress(data._id);
                        }}
                      />
                      <label htmlFor="address">{data.address}</label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            ""
          )}
          <div className="payment">
            <div className="title">Payment Method(s)</div>
            <div className={`container ${openPayments ? "open" : ""}`}>
              <div
                className="item display"
                onClick={() => setOpenPayments(!openPayments)}
              >
                <div className="name">
                  {selectedPayment ? "Metode terpilih" : "Pilih Metode"}
                </div>
                <div className="no-ref">
                  {selectedPayment
                    ? selectedPayment.nama_metode
                    : "No.Rekening/No.Hp"}
                </div>
              </div>
              {payments.map((data) => (
                <div
                  className="item"
                  key={data._id}
                  onClick={() => {
                    setOpenPayments(!openPayments);
                    setMethod((prev) => ({
                      ...prev,
                      payment: data._id,
                    }));
                    setSelectedPayment(data);
                  }}
                >
                  <div className="name">{data.nama_metode}</div>
                  <div className="no-ref">
                    {data.deskripsi_metode_pembayaran}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="total-price">
            <div className="text">Total price</div>
            <div className="amount">
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>
          <div className="checkout" onClick={checkout}>
            Checkout
          </div>
        </div>
        {orderPending > 0 ? (
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
      <ToastContainer />
    </>
  );
}
