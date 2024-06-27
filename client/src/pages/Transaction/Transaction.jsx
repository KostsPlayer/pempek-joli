import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Layout from "../../component/Layout/Layout";
import Loader from "../../helper/Loader";
import dayjs from "dayjs";
import "dayjs/locale/id";
import isBetween from "dayjs/plugin/isBetween";
import AlertMessage from "../../helper/AlertMessage";
import { ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import Invoice from "./Invoice/Invoice";
import GetData from "../../helper/GetData";

export default function Transaction() {
  axios.defaults.withCredentials = true;

  dayjs.locale("id");
  dayjs.extend(isBetween);

  const { toastMessage } = AlertMessage();
  const location = useLocation();
  const navigate = useNavigate();

  const { getToken } = GetData();
  const objectToken = JSON.parse(getToken);
  const token = objectToken.token;

  const printRef = useRef(null);

  useEffect(() => {
    if (location.state?.messageLogin) {
      toastMessage("success", location.state.messageLogin);
      navigate(location.pathname, {
        state: { ...location.state, messageLogin: undefined },
        replace: true,
      });
    }
  }, [location.state, location.pathname, navigate, toastMessage]);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [openStatuses, setOpenStatuses] = useState(
    new Array(data.length).fill(false)
  );
  const [statusFilter, setStatusFilter] = useState({
    Completed: false,
    Pending: false,
    Cancelled: false,
  });
  const [collectFilter, setCollectFilter] = useState({
    takeaway: false,
    dineIn: false,
    shipping: false,
  });
  const [paymentFilter, setPaymentFilter] = useState({
    qris: false,
    cash: false,
  });
  const [periodFilter, setPeriodFilter] = useState("");
  const [customPeriod, setCustomPeriod] = useState({ start: "", end: "" });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    const fetchAddress = axios.get(
      "https://pempek-joli-server.vercel.app/api/alamatpengiriman/alamat",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const fetchPayments = axios.get(
      "https://pempek-joli-server.vercel.app/api/payments",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const fetchOrders = axios.get(
      "https://pempek-joli-server.vercel.app/api/order",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Promise.all([fetchAddress, fetchPayments, fetchOrders])
      .then(([addressRes, paymentRes, orderRes]) => {
        const addressData = addressRes.data.alamat;
        const paymentData = paymentRes.data.data;
        const orderData = orderRes.data.data;

        const arrayData = orderData.map((data) => {
          const selectedAddress = addressData.find(
            (address) => address._id === data.id_alamat_pengiriman
          );

          const selectedPayment = paymentData.find(
            (payment) => payment._id === data.id_MetodePembayaran
          );

          return {
            transactionId: data._id,
            status: data.status_pesanan,
            collect: data.metode_pengambilan,
            amount: data.total_harga,
            date: data.tanggal_pesanan,
            address: selectedAddress ? selectedAddress.address : "No Address",
            payment: selectedPayment.nama_metode.toLowerCase(),
          };
        });

        setData(arrayData);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [token]);

  const toggleOpenStatus = useCallback((index) => {
    setOpenStatuses((prev) => {
      const newStatuses = [...prev];
      newStatuses[index] = !newStatuses[index];
      return newStatuses;
    });
  }, []);

  const options = useMemo(
    () => [
      { value: "Pending", label: "Pending", className: "status-pending" },
      {
        value: "Completed",
        label: "Completed",
        className: "status-completed",
      },
      { value: "Cancelled", label: "Cancelled", className: "status-cancelled" },
    ],
    []
  );

  const handleStatusClick = useCallback(
    (id, newStatus) => {
      const updatedData = data.map((item) =>
        item.transactionId === id ? { ...item, status: newStatus } : item
      );

      axios
        .put(
          `https://pempek-joli-server.vercel.app/api/order/status/${id}`,
          {
            status_pesanan: newStatus,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          toastMessage("success", res.data.message);
        })
        .catch((err) => {
          console.error(err);
        });

      setData(updatedData);

      setOpenStatuses((prev) => {
        const newStatuses = [...prev];
        newStatuses[id] = false;
        return newStatuses;
      });
    },
    [data]
  );

  const handleStatusChange = useCallback((e) => {
    setStatusFilter((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  }, []);

  const handleCollectChange = useCallback((e) => {
    setCollectFilter((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  }, []);

  const handlePaymentChange = useCallback((e) => {
    setPaymentFilter((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  }, []);

  const handleCustomPeriodChange = useCallback((e) => {
    const { name, value } = e.target;
    setCustomPeriod((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handlePeriodChange = useCallback((e) => {
    const id = e.target.id;

    // Toggle selected period
    setPeriodFilter((prevSelected) => (prevSelected === id ? "" : id));
  }, []);

  const filterData = useCallback(
    (data) => {
      let filteredData = data;

      // Filter based on status
      const statusKeys = Object.keys(statusFilter);
      if (statusKeys.some((key) => statusFilter[key])) {
        filteredData = filteredData.filter((item) => statusFilter[item.status]);
      }

      // Filter based on collect
      const collectKeys = Object.keys(collectFilter);
      if (collectKeys.some((key) => collectFilter[key])) {
        filteredData = filteredData.filter(
          (item) => collectFilter[item.collect]
        );
      }

      // Filter based on payment
      const paymentKeys = Object.keys(paymentFilter);
      if (paymentKeys.some((key) => paymentFilter[key])) {
        filteredData = filteredData.filter(
          (item) => paymentFilter[item.payment]
        );
      }

      // Filter based on period
      if (periodFilter === "today") {
        filteredData = filteredData.filter((item) =>
          dayjs(item.date).isSame(dayjs(), "day")
        );
      } else if (periodFilter === "week") {
        filteredData = filteredData.filter((item) =>
          dayjs(item.date).isSame(dayjs(), "week")
        );
      } else if (periodFilter === "month") {
        filteredData = filteredData.filter((item) =>
          dayjs(item.date).isSame(dayjs(), "month")
        );
      } else if (periodFilter === "custom") {
        const start = dayjs(customPeriod.start);
        const end = dayjs(customPeriod.end);
        filteredData = filteredData.filter((item) =>
          dayjs(item.date).isBetween(start, end, null, "[]")
        );
      }

      return filteredData;
    },
    [collectFilter, paymentFilter, statusFilter, periodFilter, customPeriod]
  );

  const filteredData = useMemo(() => filterData(data), [data, filterData]);

  const formatPrice = useCallback((price) => {
    const priceInRupiah = price * 1000;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(priceInRupiah);
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleInvoice = useCallback((item) => {
    setSelectedInvoice(item);
  }, []);

  useEffect(() => {
    if (selectedInvoice) {
      handlePrint();
    }
  }, [selectedInvoice]);

  const goToMap = useCallback(
    (dataId) => {
      const getTransaction = filteredData.find(
        (item) => item.transactionId === dataId
      );

      navigate(`/go-shopping/${dataId}`, {
        state: {
          destination: getTransaction
            ? getTransaction.address
            : "Destination not found",
          transactionId: getTransaction
            ? getTransaction.transactionId
            : "Transaction ID not found",
        },
      });
    },
    [filteredData, navigate]
  );

  /** pagination */
  const itemsPerPage = 6;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  useEffect(() => {
    console.log(currentPage, totalPages);
  }, [currentPage, totalPages]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Layout>
          <div className="transaction">
            <div className="transaction-table">
              <div className="pagination-controls">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <span>
                  {currentPage} of {totalPages} Pages
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
              <div className="table-controls">
                <div className="header">
                  <span className="header-col">No</span>
                  <span className="header-col">Transaction ID</span>
                  <span className="header-col">Amount</span>
                  <span className="header-col">Status</span>
                  <span className="header-col">Methods</span>
                  <span className="header-col">Action</span>
                  <span className="header-col">Date</span>
                </div>
                {currentData
                  .filter((item) => {
                    const searchLower = search.toLowerCase();
                    const formattedDate = dayjs(item.date)
                      .format("ddd, D MMM YYYY h:mm A")
                      .toLowerCase();
                    return (
                      searchLower === "" ||
                      item.payment.toLowerCase().includes(searchLower) ||
                      item.collect.toLowerCase().includes(searchLower) ||
                      item.status.toLowerCase().includes(searchLower) ||
                      item.transactionId.toLowerCase().includes(searchLower) ||
                      item.amount.toString().includes(searchLower) ||
                      formattedDate.toString().includes(searchLower)
                    );
                  })
                  .map((item, index) => {
                    const selectedOption = options.find(
                      (option) => option.value === item.status
                    );

                    return (
                      <div className="row" key={item.transactionId}>
                        <div className="col">
                          {indexOfFirstItem + index + 1}
                        </div>
                        <div className="col">{item.transactionId}</div>
                        <div className="col">{formatPrice(item.amount)}</div>
                        <div className="col">
                          <div
                            className={`container ${
                              openStatuses[item.transactionId] ? "open" : ""
                            }`}
                          >
                            <div
                              className={`dis-status selected ${selectedOption.className}`}
                              onClick={() =>
                                toggleOpenStatus(item.transactionId)
                              }
                            >
                              {selectedOption.label}
                            </div>
                            {openStatuses[item.transactionId] &&
                              options
                                .filter(
                                  (option) => option.value !== item.status
                                )
                                .map((option) => (
                                  <div
                                    key={option.value}
                                    className={`dis-status ${option.className}`}
                                    onClick={() =>
                                      handleStatusClick(
                                        item.transactionId,
                                        option.value
                                      )
                                    }
                                  >
                                    {option.label}
                                  </div>
                                ))}
                            {console.log()}
                          </div>
                          <span
                            className="material-symbols-outlined edit-button"
                            onClick={() => toggleOpenStatus(item.transactionId)}
                          >
                            edit_note
                          </span>
                        </div>
                        <div className="col">
                          <div
                            className={`dis-payment ${
                              item.payment === "cash" ? "cash" : "credit"
                            }`}
                          >
                            {item.payment !== "cash" ? (
                              <span className="material-symbols-outlined">
                                credit_card
                              </span>
                            ) : item.payment === "cash" ? (
                              <span className="material-symbols-outlined">
                                paid
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                          <div
                            className={`dis-collect ${
                              item.collect === "takeaway"
                                ? "takeaway"
                                : item.collect === "dineIn"
                                ? "dine-in"
                                : "shipping"
                            }`}
                          >
                            {item.collect === "takeaway" ? (
                              <span className="material-symbols-outlined">
                                package_2
                              </span>
                            ) : item.collect === "dineIn" ? (
                              <span className="material-symbols-outlined">
                                local_dining
                              </span>
                            ) : item.collect === "shipping" ? (
                              <span className="material-symbols-outlined">
                                local_shipping
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>

                        <div className="col">
                          <span
                            className="material-symbols-outlined"
                            onClick={() => goToMap(item.transactionId)}
                          >
                            share_location
                          </span>
                          <span
                            className="material-symbols-outlined"
                            onClick={() => handleInvoice(item)}
                          >
                            print_connect
                          </span>
                        </div>
                        <div className="col">
                          <span>
                            {dayjs(item.date).format("ddd, D MMM YYYY")}
                          </span>
                          <span>{dayjs(item.date).format("h:mm A")}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="transaction-filter">
              <div className="search">
                <div className="title">Search</div>
                <input
                  type="text"
                  name="search"
                  placeholder="Search"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="period">
                <div className="title">Period</div>
                <div className="container">
                  <input
                    type="radio"
                    name="period-filter"
                    id="today"
                    checked={periodFilter === "today"}
                    onChange={handlePeriodChange}
                  />
                  <label htmlFor="today">Today</label>
                </div>
                <div className="container">
                  <input
                    type="radio"
                    name="period-filter"
                    id="week"
                    checked={periodFilter === "week"}
                    onChange={handlePeriodChange}
                  />
                  <label htmlFor="week">This week</label>
                </div>
                <div className="container">
                  <input
                    type="radio"
                    name="period-filter"
                    id="month"
                    checked={periodFilter === "month"}
                    onChange={handlePeriodChange}
                  />
                  <label htmlFor="month">This month</label>
                </div>
                <div className="container">
                  <div className="container-child">
                    <input
                      type="radio"
                      name="period-filter"
                      id="custom"
                      checked={periodFilter === "custom"}
                      onChange={handlePeriodChange}
                    />
                    <label htmlFor="custom">Custom</label>
                  </div>
                  {periodFilter === "custom" && (
                    <>
                      <div className="custom-date">
                        <div className="wrap">
                          <span>start date</span>
                          <span>:</span>
                          <input
                            type="date"
                            name="start"
                            value={customPeriod.start}
                            onChange={handleCustomPeriodChange}
                          />
                        </div>
                        <div className="wrap">
                          <span>end date</span>
                          <span>:</span>
                          <input
                            type="date"
                            name="end"
                            value={customPeriod.end}
                            onChange={handleCustomPeriodChange}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="status">
                <div className="title">Status</div>
                <div className="container">
                  <input
                    type="checkbox"
                    name="Completed"
                    id="Completed"
                    checked={statusFilter.Completed}
                    onChange={handleStatusChange}
                  />
                  <label htmlFor="Completed">Completed</label>
                </div>
                <div className="container">
                  <input
                    type="checkbox"
                    name="Pending"
                    id="Pending"
                    checked={statusFilter.Pending}
                    onChange={handleStatusChange}
                  />
                  <label htmlFor="Pending">Pending</label>
                </div>
                <div className="container">
                  <input
                    type="checkbox"
                    name="Cancelled"
                    id="Cancelled"
                    checked={statusFilter.Cancelled}
                    onChange={handleStatusChange}
                  />
                  <label htmlFor="Cancelled">Cancelled</label>
                </div>
              </div>
              <div className="collect">
                <div className="title">Collect Method(s)</div>
                <div className="container">
                  <input
                    type="checkbox"
                    name="takeaway"
                    id="takeaway"
                    checked={collectFilter.takeaway}
                    onChange={handleCollectChange}
                  />
                  <label htmlFor="takeaway">Takeaway</label>
                </div>
                <div className="container">
                  <input
                    type="checkbox"
                    name="dineIn"
                    id="dineIn"
                    checked={collectFilter.dineIn}
                    onChange={handleCollectChange}
                  />
                  <label htmlFor="dineIn">Dinein</label>
                </div>
                <div className="container">
                  <input
                    type="checkbox"
                    name="shipping"
                    id="shipping"
                    checked={collectFilter.shipping}
                    onChange={handleCollectChange}
                  />
                  <label htmlFor="shipping">Shipping</label>
                </div>
              </div>
              <div className="payment">
                <div className="title">Payment Method(s)</div>
                <div className="container">
                  <input
                    type="checkbox"
                    name="qris"
                    id="qris"
                    checked={paymentFilter.qris}
                    onChange={handlePaymentChange}
                  />
                  <label htmlFor="qris">Qris</label>
                </div>
                <div className="container">
                  <input
                    type="checkbox"
                    name="cash"
                    id="cash"
                    checked={paymentFilter.cash}
                    onChange={handlePaymentChange}
                  />
                  <label htmlFor="cash">Cash</label>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "none",
            }}
          >
            {selectedInvoice && (
              <Invoice ref={printRef} transaction={selectedInvoice} />
            )}
          </div>
        </Layout>
      )}
      <ToastContainer />
    </>
  );
}
