import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSave,
  FiEdit2,
  FiCamera,
} from "react-icons/fi";
import MapPicker from "../components/MapPicker";
import toast from "react-hot-toast";

// ← replace these with your Cloudinary values
const CLOUD_NAME = "YOUR_CLOUD_NAME";
const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";

export default function Profile() {
  const { currentUser, userProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [position, setPosition] = useState(null);
  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    address: "",
  });

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

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);

    try {
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

      await updateProfile(auth.currentUser, { photoURL });
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
      await updateProfile(auth.currentUser, {
        displayName: form.displayName,
      });

      await updateDoc(doc(db, "users", currentUser.uid), {
        ...form,
        location: position ? { lat: position[0], lng: position[1] } : null,
        updatedAt: new Date().toISOString(),
      });

      toast.success("Profile updated!");
      setEditing(false);
    } catch (e) {
      toast.error("Failed to update profile");
      console.error(e);
    } finally {
      setSaving(false);
    }
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
        {/* Profile Card */}
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

          {/* Profile Fields */}
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

          {/* Save / Cancel */}
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
          </div>

          <MapPicker
            position={position}
            setPosition={setPosition}
            height="300px"
            fullscreenable={true}
          />

          {position && editing && (
            <button
              className="save-location-btn"
              onClick={handleSave}
              style={{ marginTop: "0.75rem" }}
            >
              Save Location
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
