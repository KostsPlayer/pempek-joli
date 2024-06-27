import React, { useState, useCallback, useEffect, useRef } from "react";
import Loader from "../../helper/Loader";
import Layout from "../../component/Layout/Layout";
import {
  useJsApiLoader,
  GoogleMap,
  MarkerF,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { ToastContainer } from "react-toastify";
import AlertMessage from "../../helper/AlertMessage";
import { useLocation } from "react-router-dom";

const center = {
  lat: -6.874217158786191,
  lng: 107.57563692956228,
};

const libraries = ["places"];

export default function GoShipping() {
  const [position, setPosition] = useState(center);
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [travelMode, setTravelMode] = useState("DRIVING"); // Default value as a string
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const originRef = useRef(null);
  const destinationRef = useRef(null);

  const location = useLocation();
  const { toastMessage } = AlertMessage();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const travelModes = [
    { mode: "DRIVING", icon: "directions_car" },
    { mode: "TRANSIT", icon: "directions_subway" },
    { mode: "WALKING", icon: "directions_run" },
  ];

  const calculateRoute = useCallback(async () => {
    if (!isLoaded || !google) {
      return;
    }

    if (originRef.current.value === "" || destinationRef.current.value === "") {
      toastMessage("error", "Please provide both origin and destination.");
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    try {
      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: google.maps.TravelMode[travelMode],
      });

      setDirectionsResponse(results);
      setDistance(results.routes[0].legs[0].distance.text);
      setDuration(results.routes[0].legs[0].duration.text);
    } catch (error) {
      if (error.code === "ZERO_RESULTS") {
        toastMessage(
          "error",
          "No route could be found between the origin and destination."
        );
      } else {
        toastMessage("error", "An error occurred while calculating the route.");
      }
    }
  }, [isLoaded, travelMode]);

  useEffect(() => {
    if (originRef.current) {
      originRef.current.value =
        "Universitas Logistik dan Bisnis Internasional (ULBI), Jl. Sariasih, Sarijadi, Bandung City, West Java, Indonesia";
    }

    if (destinationRef.current) {
      destinationRef.current.value = location.state.destination;
    }
  }, [originRef.current, destinationRef.current]);

  const clearCalculate = useCallback(() => {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destinationRef.current.value = "";
  }, []);

  if (!isLoaded) {
    return <Loader />;
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Layout>
          <div className="go-shipping">
            <div className="map">
              <GoogleMap
                key={
                  directionsResponse ? "with-directions" : "without-directions"
                }
                center={center}
                zoom={15}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                options={{
                  streetViewControl: false,
                }}
                onLoad={(map) => setMap(map)}
              >
                <MarkerF position={position} />
                {directionsResponse && (
                  <DirectionsRenderer directions={directionsResponse} />
                )}
              </GoogleMap>
            </div>
            <div className="main">
              <div className="transaction-id">
                <span>Transaction ID :</span>
                <span>{location.state.transactionId}</span>
              </div>
              <Autocomplete>
                <div className="origin">
                  <label htmlFor="origin">Origin :</label>
                  <input
                    type="text"
                    name="origin"
                    id="origin"
                    ref={originRef}
                  />
                </div>
              </Autocomplete>
              <Autocomplete>
                <div className="destination">
                  <label htmlFor="destination">Destination :</label>
                  <input
                    type="text"
                    name="destination"
                    id="destination"
                    placeholder="Destination"
                    ref={destinationRef}
                  />
                </div>
              </Autocomplete>
              <div className="info">
                <div className="title">Information :</div>
                <div className="info-detail">
                  <div className="distance">
                    <span>Distance</span>
                    <span>:</span>
                    <span className="result">{distance}</span>
                  </div>
                  <div className="duration">
                    <span>Duration</span>
                    <span>:</span>
                    <span className="result">{duration}</span>
                  </div>
                </div>
              </div>
              <div className="execute">
                <div className="travel-method">
                  <div className="title">Travel Method :</div>
                  <div className="list">
                    {travelModes.map((item) => (
                      <span
                        key={item.mode}
                        className={`material-symbols-outlined ${
                          travelMode === item.mode ? "active" : ""
                        }`}
                        onClick={() => setTravelMode(item.mode)}
                      >
                        {item.icon}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="buttons">
                  <div className="title">Execute :</div>
                  <div className="wrapper">
                    <div className="container" onClick={calculateRoute}>
                      <span className="material-symbols-outlined">
                        calculate
                      </span>
                      <span>Calculate Route</span>
                    </div>
                    <div
                      className="container"
                      onClick={() => map.panTo(center)}
                    >
                      <span className="material-symbols-outlined">
                        home_work
                      </span>
                      <span>Base</span>
                    </div>
                    <div className="container" onClick={clearCalculate}>
                      <span className="material-symbols-outlined">
                        restart_alt
                      </span>
                      <span>Clear Route</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      )}
      <ToastContainer />
    </>
  );
}
