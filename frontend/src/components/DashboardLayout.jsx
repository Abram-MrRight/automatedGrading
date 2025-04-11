import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const { role, logout } = useContext(AuthContext);

  return (
    <div style={styles.container}>
      {/* Sidebar (Always Visible) */}
      <aside style={styles.sidebar}>
        {/* <h3>Dashboard</h3> */}
        <nav>
          <ul style={styles.navList}>
            <li style={styles.navItem}><Link to="/dashboard" style={styles.navLink}>Dashboard</Link></li>
            {role === "student" && (
              <>
                <li style={styles.navItem}><Link to="/submission" style={styles.navLink}>Assignments</Link></li>
                <li style={styles.navItem}><Link to="/grades" style={styles.navLink}>View Grades</Link></li>
                <li style={styles.navItem}><Link to="/feedback" style={styles.navLink}>Feedback</Link></li>
              </>
            )}

            {role === "educator" && (
              <>
                <li style={styles.navItem}><Link to="/manage-exams" style={styles.navLink}>Manage Exams</Link></li>
                <li style={styles.navItem}><Link to="/review" style={styles.navLink}>Review Submissions</Link></li>
                <li style={styles.navItem}><Link to="/rubrics" style={styles.navLink}>Manage Rubrics</Link></li>
                <li style={styles.navItem}><Link to="/reports" style={styles.navLink}>Student Reports</Link></li>
                <li style={styles.navItem}><Link to="/students" style={styles.navLink}>Manage Students</Link></li>
              </>
            )}
          </ul>
        </nav>
        <button onClick={logout} style={styles.logoutButton}>Logout</button>
      </aside>

      {/* Main Content Section (Changes Based on Route) */}
      <main style={styles.mainContent}>
        <Outlet />  {/* This will load different pages inside the main section */}
      </main>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    minHeight: "90vh",
    width: "80vw",
    // overflowY: "scroll"
  },
  sidebar: {
    width: "150px",
    backgroundColor: "#2c3e50",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  navList: {
    listStyleType: "none",
    padding: 0,
    width: "100%",
  },
  navItem: {
    marginBottom: "15px",
  },
  navLink: {
    textDecoration: "none",
    color: "white",
    fontSize: "16px",
  },
  logoutButton: {
    marginTop: "auto",
    padding: "10px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
  },
  mainContent: {
    flex: 1,
    padding: "20px",
    backgroundColor: "#ecf0f1",
    color: "#000",
    // overflowY: "scroll"
  },
  graphPlaceholder: {
    width: "100%",
    height: "200px",
    backgroundColor: "#dfe6e9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    color: "#333",
    marginTop: "10px"
  }
};

export default DashboardLayout;