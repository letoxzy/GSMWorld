import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { FiSearch, FiMapPin, FiX } from "react-icons/fi";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16);
  }, [position]);
  return null;
}

function ClickHandler({ onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function SearchBar({
  search,
  setSearch,
  suggestions,
  setSuggestions,
  searching,
  onSelect,
  onMyLocation,
}) {
  return (
    <div className="map-search-bar">
      <div className="map-search-input-wrap">
        <FiSearch className="map-search-icon" />
        <input
          type="text"
          placeholder="Search for your location in Nigeria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setSuggestions([]);
            }}
          >
            <FiX />
          </button>
        )}
        <button
          className="my-location-btn"
          onClick={onMyLocation}
          title="Use my location"
        >
          📍
        </button>
      </div>

      {(suggestions.length > 0 || searching) && (
        <div className="map-suggestions">
          {searching && (
            <div className="map-suggestion-item searching">🔍 Searching...</div>
          )}
          {suggestions.map((item, i) => (
            <div
              key={i}
              className="map-suggestion-item"
              onClick={() => onSelect(item)}
            >
              <FiMapPin className="suggestion-icon" />
              <span>{item.display_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MapPicker({
  position,
  setPosition,
  height = "300px",
  fullscreenable = true,
}) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [flyTo, setFlyTo] = useState(null);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(search), 500);
  }, [search]);

  async function searchLocation(query) {
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + " Nigeria",
        )}&limit=5&countrycodes=ng`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  }

  function selectSuggestion(item) {
    const pos = [parseFloat(item.lat), parseFloat(item.lon)];
    setPosition(pos);
    setFlyTo(pos);
    setSearch(item.display_name);
    setSuggestions([]);
  }

  async function reverseGeocode(p) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${p[0]}&lon=${p[1]}`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      if (data.display_name) setSearch(data.display_name);
    } catch (e) {
      console.error(e);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const p = [pos.coords.latitude, pos.coords.longitude];
        setPosition(p);
        setFlyTo(p);
        await reverseGeocode(p);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Location access denied. Please allow location access in your browser settings.",
            );
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            alert("Location request timed out. Please try again.");
            break;
          default:
            alert("Could not get your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  function handleMapClick(pos) {
    setPosition(pos);
    setFlyTo(pos);
    reverseGeocode(pos);
  }

  return (
    <div className="map-picker-wrap">
      {/* Header */}
      {fullscreenable && (
        <div className="map-picker-header">
          <p className="map-hint-text">
            🗺️ Search or click on map to pin your location
          </p>
          <button
            className="fullscreen-map-btn"
            onClick={() => setMapFullscreen(true)}
          >
            ⛶ Fullscreen
          </button>
        </div>
      )}

      {/* Search bar - normal */}
      <SearchBar
        search={search}
        setSearch={setSearch}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
        searching={searching}
        onSelect={selectSuggestion}
        onMyLocation={useMyLocation}
      />

      {/* Locating indicator */}
      {locating && (
        <div className="locating-indicator">
          <span className="locating-spinner" />
          Detecting your location...
        </div>
      )}

      {/* Normal Map */}
      <MapContainer
        center={position || [9.082, 8.6753]}
        zoom={position ? 14 : 6}
        minZoom={5}
        maxZoom={19}
        maxBounds={[
          [4.2406, 2.6917],
          [13.8659, 14.678],
        ]}
        maxBoundsViscosity={1.0}
        style={{ height, width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="© OpenStreetMap contributors © CARTO"
          subdomains="abcd"
          maxZoom={19}
        />
        <ClickHandler onPositionChange={handleMapClick} />
        {flyTo && <MapFlyTo position={flyTo} />}
        {position && <Marker position={position} />}
      </MapContainer>

      {/* Coordinates */}
      {position && (
        <div className="map-coords">
          <FiMapPin />
          <span>
            {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </span>
          <span className="map-coords-hint">Location pinned ✅</span>
        </div>
      )}

      {/* Fullscreen overlay */}
      {mapFullscreen && (
        <div className="map-fullscreen-overlay">
          {/* Fullscreen topbar */}
          <div className="map-fullscreen-topbar">
            <h3>📍 Pin Your Location</h3>
            <button
              className="close-fullscreen-btn"
              onClick={() => setMapFullscreen(false)}
            >
              <FiX /> Close
            </button>
          </div>

          {/* Fullscreen search */}
          <div className="fullscreen-search-wrap">
            <SearchBar
              search={search}
              setSearch={setSearch}
              suggestions={suggestions}
              setSuggestions={setSuggestions}
              searching={searching}
              onSelect={selectSuggestion}
              onMyLocation={useMyLocation}
            />
            {locating && (
              <div className="locating-indicator">
                <span className="locating-spinner" />
                Detecting your location...
              </div>
            )}
          </div>

          {/* Fullscreen Map */}
          <div style={{ flex: 1, position: "relative" }}>
            <MapContainer
              center={position || [9.082, 8.6753]}
              zoom={position ? 14 : 6}
              minZoom={5}
              maxZoom={19}
              maxBounds={[
                [4.2406, 2.6917],
                [13.8659, 14.678],
              ]}
              maxBoundsViscosity={1.0}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution="© OpenStreetMap contributors © CARTO"
                subdomains="abcd"
                maxZoom={19}
              />
              <ClickHandler onPositionChange={handleMapClick} />
              {flyTo && <MapFlyTo position={flyTo} />}
              {position && <Marker position={position} />}
            </MapContainer>
          </div>

          {/* Fullscreen footer */}
          <div className="map-fullscreen-footer">
            <span>
              {position
                ? `📍 ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`
                : "Click on the map to pin your location"}
            </span>
            <button
              className="save-close-btn"
              onClick={() => setMapFullscreen(false)}
            >
              ✅ Save & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
