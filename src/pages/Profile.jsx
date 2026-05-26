import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSave,
  FiEdit2,
  FiCamera,
  FiMaximize2,
  FiMinimize2,
  FiX,
} from "react-icons/fi";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ← replace these with your Cloudinary values
const CLOUD_NAME = "YOUR_CLOUD_NAME";
const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";

function MapPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function Profile() {
  const { currentUser, userProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    address: "",
  });
  const [position, setPosition] = useState(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setForm({
        displayName: userProfile.displayName || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
      });
      if (userProfile.location) {
        setPosition([userProfile.location.lat, userProfile.location.lng]);
      }
    }
  }, [userProfile]);

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // show preview immediately
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);

    try {
      // upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "gsmworld/avatars");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      const photoURL = data.secure_url;

      // update Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL });

      // update Firestore user document
      await updateDoc(doc(db, "users", currentUser.uid), { photoURL });

      toast.success("Profile photo updated! 🎉");
    } catch (e) {
      toast.error("Failed to upload photo");
      setAvatarPreview(null);
      console.error(e);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // update Firebase Auth display name
      await updateProfile(auth.currentUser, { displayName: form.displayName });

      // update Firestore
      await updateDoc(doc(db, "users", currentUser.uid), {
        ...form,
        location: position ? { lat: position[0], lng: position[1] } : null,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Profile updated!");
      setEditing(false);
    } catch (e) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        toast.success("Location detected!");
      },
      () => toast.error("Could not get your location"),
    );
  }

  const currentPhoto = avatarPreview || currentUser?.photoURL;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>
          <FiUser /> My Profile
        </h1>
        {!editing && (
          <button className="edit-btn" onClick={() => setEditing(true)}>
            <FiEdit2 /> Edit Profile
          </button>
        )}
      </div>

      <div className="profile-layout">
        <div className="profile-card">
          {/* Avatar Upload */}
          <div className="profile-avatar">
            <div className="avatar-wrap">
              {currentPhoto ? (
                <img src={currentPhoto} alt="avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {form.displayName?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              {/* Upload button overlay */}
              <label htmlFor="avatar-upload" className="avatar-upload-btn">
                {uploadingAvatar ? (
                  <span className="avatar-spinner" />
                ) : (
                  <FiCamera />
                )}
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: "none" }}
              />
            </div>
            <p className="avatar-hint">Click the camera icon to change photo</p>
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <FiUser className="field-icon" />
              <div>
                <label>Full Name</label>
                {editing ? (
                  <input
                    value={form.displayName}
                    onChange={(e) =>
                      setForm({ ...form, displayName: e.target.value })
                    }
                  />
                ) : (
                  <p>{form.displayName || "Not set"}</p>
                )}
              </div>
            </div>

            <div className="profile-field">
              <FiMail className="field-icon" />
              <div>
                <label>Email</label>
                <p>{currentUser?.email}</p>
              </div>
            </div>

            <div className="profile-field">
              <FiPhone className="field-icon" />
              <div>
                <label>Phone Number</label>
                {editing ? (
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+234..."
                  />
                ) : (
                  <p>{form.phone || "Not set"}</p>
                )}
              </div>
            </div>

            <div className="profile-field">
              <FiMapPin className="field-icon" />
              <div>
                <label>Delivery Address</label>
                {editing ? (
                  <textarea
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="Enter your address..."
                  />
                ) : (
                  <p>{form.address || "Not set"}</p>
                )}
              </div>
            </div>
          </div>

          {editing && (
            <div className="profile-actions">
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                <FiSave /> {saving ? "Saving..." : "Save Changes"}
              </button>
              <button className="cancel-btn" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Location Map */}
        <div className="location-card">
          <div className="location-card-header">
            <h3>
              <FiMapPin /> Delivery Location
            </h3>
            <div className="map-header-btns">
              <button className="use-location-btn" onClick={useMyLocation}>
                📍 Use My Location
              </button>
              <button
                className="fullscreen-map-btn"
                onClick={() => setMapFullscreen(!mapFullscreen)}
              >
                {mapFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                {mapFullscreen ? "Minimize" : "Fullscreen"}
              </button>
            </div>
          </div>
          <p className="map-hint">
            Click on the map to pin your delivery location
          </p>

          {/* Fullscreen overlay */}
          {mapFullscreen && (
            <div className="map-fullscreen-overlay">
              <div className="map-fullscreen-header">
                <h3>📍 Pin Your Delivery Location</h3>
                <button
                  className="close-fullscreen-btn"
                  onClick={() => setMapFullscreen(false)}
                >
                  <FiX /> Close
                </button>
              </div>
              <p className="map-fullscreen-hint">
                Click anywhere on the map to set your location
              </p>
              <MapContainer
                center={position || [6.4698, 7.5003]}
                zoom={13}
                style={{ height: "calc(100vh - 120px)", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap"
                />
                <MapPicker position={position} setPosition={setPosition} />
              </MapContainer>
              {position && (
                <div className="fullscreen-coords">
                  📍 Lat: {position[0].toFixed(5)}, Lng:{" "}
                  {position[1].toFixed(5)}
                  <button
                    className="save-location-btn"
                    onClick={() => {
                      handleSave();
                      setMapFullscreen(false);
                    }}
                  >
                    ✅ Save & Close
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Normal map */}
          <div className="profile-map">
            <MapContainer
              center={position || [6.4698, 7.5003]}
              zoom={13}
              style={{ height: "300px", width: "100%", borderRadius: "12px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap"
              />
              <MapPicker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>

          {position && (
            <div className="location-coords">
              📍 Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
              {editing && (
                <button className="save-location-btn" onClick={handleSave}>
                  Save Location
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
