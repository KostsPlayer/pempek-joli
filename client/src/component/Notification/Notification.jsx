import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import GetData from "../../helper/GetData";
import axios from "axios";
import { differenceTime, durationTime, calculateTime } from "../../helper/Time";

function Notification({ openNotife, closeNotife }) {
  axios.defaults.withCredentials = true;

  const [order, setOrder] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [successPayment, setSuccessPayment] = useState([]);
  const [cancelledPayment, setCancelledPayment] = useState([]);

  const { getToken, role } = GetData();
  const objectToken = JSON.parse(getToken);
  const token = objectToken.token;

  const getOrder = useCallback(() => {
    axios
      .get("https://pempek-joli-server.vercel.app/api/order/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = res.data.data;

        const orderData = data
          .filter((item) => {
            return Object.values(item).every(
              (value) => value !== null && value !== "" && value !== undefined
            );
          })
          .map((data) => {
            return data;
          });

        setOrder(orderData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [token]);

  const getPayment = useCallback(() => {
    axios
      .get("https://pempek-joli-server.vercel.app/api/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = res.data.data;

        const successPaymentData = data.filter(
          (item) => item.status_pembayaran === "Success"
        );

        const cancelledPaymentData = data.filter(
          (item) => item.status_pembayaran === "Cancelled"
        );

        setCancelledPayment(cancelledPaymentData);
        setSuccessPayment(successPaymentData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [token]);

  const getUserOrder = useCallback(() => {
    axios
      .get("https://pempek-joli-server.vercel.app/api/order", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = res.data.data;

        // const paymentDatePromise = data.map((dataItem) => {
        //   return axios
        //     .get(
        //       `https://pempek-joli-server.vercel.app/api/payments/${dataItem.id_pembayaran}`,
        //       {
        //         headers: {
        //           Authorization: `Bearer ${token}`,
        //         },
        //       }
        //     )
        //     .then((res) => {
        //       return res.data.data; // Mengembalikan data dari respons
        //     })
        //     .catch((err) => {
        //       console.error(err);
        //       return null; // Mengembalikan null jika terjadi kesalahan
        //     });
        // });

        // Promise.all(paymentDatePromise)
        //   .then((results) => {
        //     const validResults = results.filter((result) => result !== null); // Memfilter hasil yang valid
        //     console.log("Hasil:", validResults);
        //   })
        //   .catch((error) => {
        //     console.error("Kesalahan saat menunggu semua promise:", error);
        //   });

        const userOrderData = data.filter((item) => {
          return (
            item.hasOwnProperty("duration") &&
            Object.values(item).every(
              (value) => value !== null && value !== "" && value !== undefined
            )
          );
        });

        setUserOrder(userOrderData);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [token]);

  useEffect(() => {
    if (token) {
      getOrder();
      getPayment();
      getUserOrder();
    }
  }, [token, getOrder, getPayment, getUserOrder]);

  const combinedAdminMessages = useMemo(() => {
    const messages = [
      ...order.map((data) => ({
        type: "order",
        message: `Pesanan baru masuk! ${data.id_pengguna.fullName} telah melakukan pemesanan.`,
        time: data.tanggal_pesanan,
      })),
      ...successPayment.map((data) => ({
        type: "success",
        message:
          "Pembayaran pesanan berhasil! Pengguna telah melakukan pembayaran.",
        time: data.tanggal_pembayaran,
      })),
      ...cancelledPayment.map((data) => ({
        type: "cancelled",
        message:
          "Pemesanan dibatalkan! Pengguna tidak melakukan pembayaran selama periode waktu yang ditentukan.",
        time: data.tanggal_pembayaran,
      })),
    ];

    return messages.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [order, successPayment, cancelledPayment]);

  const combinedUserMessages = useMemo(() => {
    return userOrder.sort(
      (a, b) => new Date(b.tanggal_pesanan) - new Date(a.tanggal_pesanan)
    );
  }, [userOrder]);

  const recentAdminMessages = combinedAdminMessages.slice(0, 4);

  const recentUserMessages = combinedUserMessages.slice(0, 4);

  if (!openNotife) return null;

  return (
    <>
      <div className="notification" onClick={closeNotife}>
        <div
          className="overlay"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="day">Today</div>
          {role === "admin" &&
            recentAdminMessages.map((data, index) => (
              <div
                className={`item ${
                  data.type === "order"
                    ? "yellow"
                    : data.type === "success"
                    ? "green"
                    : "red"
                }`}
                key={index}
              >
                <div className="content">
                  <div className="text">
                    <span>{data.message}</span>
                  </div>
                </div>
                <div className="time">{differenceTime(data.time)} ago</div>
              </div>
            ))}
          {role === "user" &&
            recentUserMessages.map((data, index) => {
              const durationShipping = durationTime(
                data.duration,
                " tahun ",
                " bulan ",
                " hari ",
                " jam ",
                " menit ",
                " detik "
              );

              const estimationShipping = calculateTime(data.duration);
              const estimationFormat = estimationShipping.format("HH:mm");

              return (
                <div className="item blue" key={index}>
                  <div className="content">
                    <div className="text">
                      <span>
                        Estimasi pemesanan selama {durationShipping}!{" "}
                      </span>
                      Pesanan akan tiba ∓ pada pukul {estimationFormat}
                    </div>
                  </div>
                  <div className="time">
                    {differenceTime(data.tanggal_pesanan)} ago
                  </div>
                </div>
              );
            })}
          <Link to={"/notification-all"} className="all-message">
            Show All Message
          </Link>
        </div>
      </div>
    </>
  );
}

export default Notification;
