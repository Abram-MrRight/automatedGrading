import { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit } from "react-icons/fa";
import defaultAvatar from "../assets/person.png";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    regNumber: "",
    age: "",
    username: "",
    email: "",
    password: "",
    profile_pic: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await Axios.get("students/me/");
      setProfile(res.data);
      setForm({
        name: res.data.name || "",
        regNumber: res.data.regNumber || "",
        age: res.data.age || "",
        username: res.data.username || "",
        email: res.data.email || "",
        password: "",
        profile_pic: null,
      });
      setPreview(res.data.profile_pic ? `http://localhost:8000${res.data.profile_pic}` : null);
    } catch (err) {
      toast.error("Failed to load profile ❌");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, profile_pic: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      await Axios.put(`students/${profile.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated successfully ✅");
      fetchProfile();
    } catch (err) {
      toast.error("Failed to update profile ❌");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h2 style={styles.header}>My Profile</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={styles.avatarContainer}>
            <img
              src={preview || defaultAvatar}
              alt="Profile"
              style={styles.avatar}
            />
            <label htmlFor="profileUpload" style={styles.editIcon}>
              <FaEdit />
              <input
                type="file"
                id="profileUpload"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div style={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="text"
              name="regNumber"
              placeholder="Registration Number"
              value={form.regNumber}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="New Password (leave blank to keep current)"
              onChange={handleChange}
              style={styles.input}
            />

            <button onClick={handleSubmit} disabled={saving} style={styles.button}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    marginBottom: "20px",
    color: "#2c3e50",
  },
  avatarContainer: {
    position: "relative",
    display: "inline-block",
    marginBottom: "20px",
  },
  avatar: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #3498db",
  },
  editIcon: {
    position: "absolute",
    bottom: "0",
    right: "0",
    backgroundColor: "#3498db",
    color: "white",
    padding: "8px",
    borderRadius: "50%",
    cursor: "pointer",
    border: "2px solid white",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "10px",
    textAlign: "left",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  button: {
    padding: "12px",
    backgroundColor: "#3498db",
    color: "white",
    fontSize: "16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Profile;
