import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../component/Layout/Layout";
import Loader from "../../helper/Loader";
import GetData from "../../helper/GetData";
import axios from "axios";
import {
  differenceTime,
  getOneMonthAgo,
  getOneWeekAgo,
  durationTime,
  calculateTime,
} from "../../helper/Time";
import Pagination from "../../component/Pagination/Pagination";

function NotificationAll() {
  axios.defaults.withCredentials = true;
  const [loading, setLoading] = useState(true);

  const [order, setOrder] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [successPayment, setSuccessPayment] = useState([]);
  const [cancelledPayment, setCancelledPayment] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [currentUserData, setCurrentUserData] = useState([]);
  const [indexOfFirstItem, setIndexOfFirstItem] = useState(0);
  const [indexOfFirstItemUser, setIndexOfFirstItemUser] = useState(0);

  const { getToken, role } = GetData();
  const objectToken = JSON.parse(getToken);
  const token = objectToken.token;

  const oneWeekAgo = getOneWeekAgo();
  const oneMonthAgo = getOneMonthAgo();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const filterData = useCallback((data, timeFrame) => {
    const cutOffDate = timeFrame === "week" ? oneWeekAgo : oneMonthAgo;

    return data.filter(
      (item) =>
        new Date(item.tanggal_pesanan || item.tanggal_pembayaran) >= cutOffDate
    );
  }, []);

  const getOrder = useCallback(() => {
    axios
      .get("https://pempek-joli-server.vercel.app/api/order/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = res.data.data;

        const orderData = data.filter((item) => {
          return Object.values(item).every(
            (value) => value !== null && value !== "" && value !== undefined
          );
        });

        setOrder(orderData);
      })
      .catch((err) => {
        console.error(err);
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
        console.error(err);
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

        const paymentDatePromise = data.map((dataItem) => {
          return axios
            .get(
              `https://pempek-joli-server.vercel.app/api/payments/${dataItem.id_pembayaran}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((res) => {
              return res.data.data; // Mengembalikan data dari respons
            })
            .catch((err) => {
              console.error(err);
              return null; // Mengembalikan null jika terjadi kesalahan
            });
        });

        Promise.all(paymentDatePromise)
          .then((results) => {
            const getPaymentDate = results
              .filter((result) => result !== null)
              .map((data) => data.payment)
              .map((item) => ({
                _id: item.id_pembayaran,
                tanggal_pembayaran: item.tanggal_pembayaran,
              }));

            const userOrderData = data.filter((item) => {
              return (
                item.hasOwnProperty("duration") &&
                Object.values(item).every(
                  (value) =>
                    value !== null && value !== "" && value !== undefined
                )
              );
            });

            userOrderData.forEach((order) => {
              const payment = getPaymentDate.find(
                (payment) => payment._id === order.id_pembayaran
              );
              if (payment) {
                order.tanggal_pembayaran = payment.tanggal_pembayaran;
              }
            });

            const filtered = filterData(userOrderData, "week");

            const sorted = filtered.sort((a, b) => {
              const dateA = new Date(a.tanggal_pesanan || a.tanggal_pembayaran);
              const dateB = new Date(b.tanggal_pesanan || b.tanggal_pembayaran);
              return dateB - dateA;
            });

            // console.log(sorted);

            setUserOrder(sorted);
          })
          .catch((error) => {
            console.error("Kesalahan saat menunggu semua promise:", error);
          });
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

  useEffect(() => {
    const combinedData = [
      ...order.map((data) => ({ ...data, type: "order" })),
      ...successPayment.map((data) => ({ ...data, type: "successPayment" })),
      ...cancelledPayment.map((data) => ({
        ...data,
        type: "cancelledPayment",
      })),
    ];

    const filtered = filterData(combinedData, "week");

    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.tanggal_pesanan || a.tanggal_pembayaran);
      const dateB = new Date(b.tanggal_pesanan || b.tanggal_pembayaran);
      return dateB - dateA;
    });

    setFilteredData(sorted);
  }, [order, successPayment, cancelledPayment]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Layout>
          <div className="notification-all">
            {role === "admin" ? (
              <>
                <Pagination
                  filteredData={filteredData}
                  setCurrentData={setCurrentData}
                  setIndexOfFirstItem={setIndexOfFirstItem}
                />
                <div className="notification-all-header">
                  <div className="col">No</div>
                  <div className="col">Message</div>
                  <div className="col">Time</div>
                  <div className="col">Action</div>
                </div>
                {currentData.map((data, index) => {
                  return (
                    <div className="notification-all-body" key={index}>
                      <div className="col">{indexOfFirstItem + index + 1}</div>
                      <div className="col">
                        {data.type === "order" && (
                          <>
                            <span className="pending">
                              Pesanan baru masuk!{" "}
                            </span>
                            {data.id_pengguna.fullName} telah melakukan
                            pemesanan.
                          </>
                        )}
                        {data.type === "successPayment" && (
                          <>
                            <span className="success">
                              Pembayaran pesanan berhasil!{" "}
                            </span>
                            {data.id_pengguna.fullName} telah melakukan
                            pembayaran.
                          </>
                        )}
                        {data.type === "cancelledPayment" && (
                          <>
                            <span className="cancelled">
                              Pemesanan dibatalkan!{" "}
                            </span>
                            {data.id_pengguna.fullName} tidak melakukan
                            pembayaran selama periode waktu yang ditentukan.
                          </>
                        )}
                      </div>
                      <div className="col">
                        {data.type === "order"
                          ? differenceTime(
                              data.tanggal_pesanan,
                              " years ",
                              " months ",
                              " days ",
                              " hours ",
                              " minutes ",
                              " seconds "
                            )
                          : differenceTime(
                              data.tanggal_pembayaran,
                              " years ",
                              " months ",
                              " days ",
                              " hours ",
                              " minutes ",
                              " seconds "
                            )}{" "}
                        ago
                      </div>
                      <div className="col">
                        <span className="material-symbols-outlined">info</span>
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                <Pagination
                  filteredData={userOrder}
                  setCurrentData={setCurrentUserData}
                  setIndexOfFirstItem={setIndexOfFirstItemUser}
                />
                <div className="notification-all-header">
                  <div className="col">No</div>
                  <div className="col">Message</div>
                  <div className="col">Time</div>
                  <div className="col">Action</div>
                </div>
                {currentUserData.map((data, index) => {
                  const durationShipping = durationTime(
                    data.duration,
                    " tahun ",
                    " bulan ",
                    " hari ",
                    " jam ",
                    " menit ",
                    " detik "
                  );

                  const estimationShipping = calculateTime(
                    data.duration,
                    data.tanggal_pembayaran
                  );
                  const estimationFormat = estimationShipping.format("HH:mm");

                  return (
                    <div className="notification-all-body">
                      <div className="col">
                        {indexOfFirstItemUser + index + 1}
                      </div>
                      <div className="col">
                        <span>
                          Estimasi pemesanan selama {durationShipping}!{" "}
                        </span>
                        Pesanan akan tiba ∓ pada pukul {estimationFormat}
                      </div>
                      <div className="col">
                        {differenceTime(
                          data.tanggal_pesanan,
                          " years ",
                          " months ",
                          " days ",
                          " hours ",
                          " minutes ",
                          " seconds "
                        )}{" "}
                        ago
                      </div>
                      <div className="col">
                        <span className="material-symbols-outlined">info</span>
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </Layout>
      )}
    </>
  );
}

export default NotificationAll;
