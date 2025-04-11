import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "../utils/Axios"

const Login = () => {
  // const [courses, setCourses] = useState([]);
  // const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      const response = await Axios.post(`login/`, { username, password });
      const { access, refresh, role } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('role', role);

      
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'educator') {
        navigate('/educator-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    }catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setResetStatus(null);
    if (!resetEmail) {
      setResetStatus({ message: "Please enter your email", type: "error" });
      return;
    }

    try {
      await axios.post("http://localhost:8000/auth/reset-password", { email: resetEmail });
      setResetStatus({ message: "Password reset request sent successfully", type: "success" });
    } catch (err) {
      setResetStatus({ message: "Failed to send reset request", type: "error" });
      console.error(err);
      
    }
  };

  return (
    <div style={styles.container}>
      <h1>Automated Exam Grading</h1>
      <h2 style={styles.title}>Login</h2>

      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="username"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={styles.forgotPassword} onClick={() => setShowForgotPassword(true)}>
        Forgot Password?
      </p>

      <p style={styles.registerText}>
        Don't have an account? <Link to="/register" style={styles.registerLink}>Register Now!</Link>
      </p>

      {showForgotPassword && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogBox}>
            <h3>Reset Password</h3>
            <p>Enter your email to request a password reset.</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              style={styles.input}
            />
            {resetStatus && (
              <p style={{ ...styles.statusMessage, color: resetStatus.type === "success" ? "green" : "red" }}>
                {resetStatus.message}
              </p>
            )}
            <div style={styles.dialogActions}>
              <button onClick={handleForgotPassword} style={styles.button}>Submit</button>
              <button onClick={() => setShowForgotPassword(false)} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
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
    fontFamily: "'Montserrat', sans-serif",
  },
  title: {
    marginBottom: "20px",
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "8px"
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
  forgotPassword: {
    marginTop: "10px",
    color: "#007bff",
    cursor: "pointer",
  },
  registerText: {
    marginTop: "10px",
  },
  registerLink: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "600",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
  dialogOverlay: {
    position: "fixed",
    top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogBox: {
    backgroundColor: "#323232",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    width: "320px"
  },
  dialogActions: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
  },
  cancelButton: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#ccc",
    color: "#000",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  statusMessage: {
    fontSize: "14px",
    marginTop: "10px",
  },
};

export default Login;