import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Registration = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post("http://localhost:8000/auth/register", {
        username,
        email,
        password,
      });

      console.log(response.json());
      
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Automated Exam Grading</h1>
      <h2 style={styles.title}>Register</h2>
      <div style={styles.formContainer}>
        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />
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
        <p>
          Already have an account? <Link to="/" style={styles.link}>Login Now!</Link>
        </p>
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
    // background: "#f4f4f4",
  },
  formContainer: {
    // background: "#fff",
    // color: "#000",
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
