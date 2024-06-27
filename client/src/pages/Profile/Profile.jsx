import React, { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../../component/Layout/Layout";
import AlertMessage from "../../helper/AlertMessage";
import { ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import pp from "./../../assets/images/pexels-valeriya-688802.jpg";
import axios from "axios";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import GetData from "../../helper/GetData";
import { jwtDecode } from "jwt-decode";

const libraries = ["places"];

export default function Profile() {
  // axios.defaults.withCredentials = true;

  const { toastMessage } = AlertMessage();
  const location = useLocation();
  const navigate = useNavigate();

  const { getToken } = GetData();
  const objectToken = JSON.parse(getToken);
  const token = objectToken.token;
  const test = jwtDecode(token);

  const autoCompleteRef = useRef(null);

  const [allProvince, setAllProvince] = useState([]);
  const [allRegency, setAllRegency] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState({});
  const [addressValues, setAddressValues] = useState({
    address: "",
    province: "",
    regency: "",
    description: "",
    zip: 0,
  });
  const [addresses, setAddresses] = useState([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (location.state?.messageLogin) {
      toastMessage("success", location.state.messageLogin);
      navigate(location.pathname, {
        state: { ...location.state, messageLogin: undefined },
        replace: true,
      });
    }
  }, [location.state, location.pathname, navigate, toastMessage]);

  useEffect(() => {
    axios
      .get(
        `https://webapi.bps.go.id/v1/api/domain/type/prov/key/${
          import.meta.env.VITE_WEB_API_KEY_ID
        }/`
      )
      .then((res) => {
        setAllProvince(res.data.data[1]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (selectedProvince.domain_id) {
      axios
        .get(
          `https://webapi.bps.go.id/v1/api/domain/type/kabbyprov/prov/${
            selectedProvince.domain_id
          }/key/${import.meta.env.VITE_WEB_API_KEY_ID}/`
        )
        .then((res) => {
          setAllRegency(res.data.data[1]);
          console.log(res.data.data[1]);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [selectedProvince.domain_id]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/alamatpengiriman/alamat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAddresses(res.data.alamat);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [token]);

  const handleProvinceChange = useCallback(
    (e) => {
      const provinceValue = e.target.value;
      const provinceObject = allProvince.find(
        (province) => province.domain_id === provinceValue
      );

      setSelectedProvince(provinceObject);
      setAddressValues((prev) => ({
        ...prev,
        province: provinceObject.domain_name,
      }));
    },
    [allProvince]
  );

  const handleRegencyChange = useCallback(
    (e) => {
      const regencyValue = e.target.value;
      const regencyObject = allRegency.find(
        (regency) => regency.domain_id === regencyValue
      );

      setAddressValues((prev) => ({
        ...prev,
        regency: regencyObject.domain_name,
      }));
    },
    [allRegency]
  );

  const onPlaceChanged = useCallback(() => {
    const place = autoCompleteRef.current.getPlace();
    setAddressValues((prev) => ({
      ...prev,
      address: place.formatted_address,
    }));
  }, []);

  const handleSubmitAddress = useCallback(
    (e) => {
      e.preventDefault();

      axios
        .post(
          "http://localhost:5000/api/alamatpengiriman",
          {
            address: addressValues.address,
            province: addressValues.province,
            city: addressValues.regency,
            description: addressValues.description,
            postal_code: addressValues.zip,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          toastMessage("success", res.data.message);
          refreshAddress();
        })
        .catch((err) => {
          console.error(err);
          console.error(err.response.data);
        });
    },
    [addressValues]
  );

  const refreshAddress = useCallback(() => {
    axios
      .get("http://localhost:5000/api/alamatpengiriman/alamat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAddresses(res.data.alamat);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [token]);

  let no = 1;

  const deleteAddress = useCallback((id) => {
    axios
      .delete(`http://localhost:5000/api/alamatpengiriman/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        toastMessage("success", res.data.message);
        refreshAddress();
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      .then((res) => {
        // console.log(res.data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [token]);

  if (!isLoaded) {
    return <div className="loader"></div>;
  }

  return (
    <>
      <Layout>
        <div className="profile">
          <div className="profile-image">
            <img src={pp} alt="test" />
            <label htmlFor="image">
              <input type="file" name="image" id="image" />
              Select Image
            </label>
          </div>
          <form className="profile-info">
            <div className="title">Personal Data</div>
            <input type="text" name="fullname" placeholder="Fullname" />
            <input type="text" name="nickname" placeholder="Nickname" />
            <input type="text" name="email" placeholder="Email" />
            <input
              type="number"
              name="phoneNumber"
              placeholder="Phone Number"
            />
            <button className="button">Submit</button>
          </form>
          <div className="profile-address">
            <form className="create-address" onSubmit={handleSubmitAddress}>
              <div className="title">New Address</div>
              <Autocomplete
                onLoad={(autoComplete) =>
                  (autoCompleteRef.current = autoComplete)
                }
                onPlaceChanged={onPlaceChanged}
                className="address"
              >
                <input type="text" name="address" placeholder="Address" />
              </Autocomplete>
              <div className="container">
                <select name="province" onChange={handleProvinceChange}>
                  <option value="" selected disabled>
                    Province
                  </option>
                  {allProvince.map((data, index) => {
                    return (
                      <option key={index} value={data.domain_id}>
                        {data.domain_name}
                      </option>
                    );
                  })}
                </select>
                <span className="material-symbols-outlined">
                  arrow_drop_down
                </span>
              </div>
              <div className="container">
                <select name="regency" onChange={handleRegencyChange}>
                  <option value="" selected disabled>
                    Regency/City
                  </option>
                  {allRegency.map((data, index) => {
                    return (
                      <option key={index} value={data.domain_id}>
                        {data.domain_name}
                      </option>
                    );
                  })}
                </select>
                <span className="material-symbols-outlined">
                  arrow_drop_down
                </span>
              </div>
              <input
                type="text"
                name="description"
                placeholder="Apt, Suite, etc (Opsional)"
                onChange={(e) => {
                  setAddressValues((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                }}
              />
              <input
                type="number"
                name="zip"
                placeholder="Zip/Postal code"
                onChange={(e) => {
                  setAddressValues((prev) => ({
                    ...prev,
                    zip: e.target.value,
                  }));
                }}
              />
              <button className="button">Create</button>
            </form>
            {addresses.map((data, index) => (
              <div className="display-address" key={index}>
                <div className="title">
                  <span className="text">Address {no++}</span>
                  <span
                    className="material-symbols-outlined"
                    onClick={() => deleteAddress(data._id)}
                  >
                    delete_forever
                  </span>
                </div>
                <div className="container" id="address">
                  <label>Address</label>
                  <input type="text" value={data.address} readOnly />
                </div>
                <div className="container" id="province">
                  <label>Province</label>
                  <input type="text" value={data.province} readOnly />
                </div>
                <div className="container" id="regency">
                  <label>Regency</label>
                  <input type="text" value={data.city} readOnly />
                </div>
                <div className="container">
                  <label id="description">Description</label>
                  <input type="text" value={data.description} readOnly />
                </div>
                <div className="container">
                  <label id="zip">Zip</label>
                  <input type="number" value={data.postal_code} readOnly />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
      <ToastContainer />
    </>
  );
}
