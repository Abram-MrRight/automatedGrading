import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Axios from "../utils/Axios";

const Registration = () => {
  const [form, setForm] = useState({
    username: "",
    // name: "",
    // age: "",
    email: "",
    // regNumber: "",
    password: "",
    confirmPassword: "educator",
    // profile_pic: null,
    role: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "confirmPassword") formData.append(key, value);
    });

    setLoading(true);

    try {
      await Axios.post("register/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      const errMsg = err.response?.data || "Registration failed.";
      const msg =
        typeof errMsg === "string"
          ? errMsg
          : Object.values(errMsg).flat().join(" ");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Registration Form</h1>
      <div style={styles.formContainer}>
        <form onSubmit={handleRegister} style={styles.form}>
          <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} style={styles.input} required />
          {/* <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} style={styles.input} required />
          <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} style={styles.input} required /> */}
          {/* <input type="text" name="regNumber" placeholder="Registration Number" value={form.regNumber} onChange={handleChange} style={styles.input} required /> */}
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} required />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} style={styles.input} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} style={styles.input} required />
          {/* <input type="file" name="profile_pic" onChange={handleChange} style={styles.input} /> */}
          <select name="role" id="role" value={form.role} onChange={handleChange} style={styles.input} required>
            <option value="">Select Role</option>
            <option value="educator">Educator</option>
            <option value="student">Student</option>
          </select>
          <div style={styles.checkboxContainer}>
            <input type="checkbox" required style={styles.checkbox} />
            <span>I Agree To The Terms & Conditions</span>
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Registering..." : "REGISTER"}
          </button>
        </form>

        <p>Already have an account? <Link to="/" style={styles.link}>Login Now!</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  formContainer: {
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "350px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    marginBottom: "10px",
  },
  checkbox: {
    marginRight: "10px",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    color: "#fff",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
  success: {
    color: "green",
    fontSize: "14px",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
  },
};

export default Registration;
