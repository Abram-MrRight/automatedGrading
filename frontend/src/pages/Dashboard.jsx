import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
// import axios from "axios";

const Dashboard = () => {
  const { role, user } = useContext(AuthContext);

  // Sample Data 
  // const pendingSubmissions = ["Essay 1", "Research Paper", "Assignment 3"];
  // const completedSubmissions = [
  //   { title: "Assignment 1", grade: "85%", feedback: "Well-written, but improve references." },
  //   { title: "Assignment 2", grade: "90%", feedback: "Great analysis, minor grammar issues." },
  // ];
  // const studentPerformanceSummary = {
  //   avgGrade: "88%",
  //   improvementAreas: ["Citations", "Conclusion Strength", "Grammar"],
  // };

  // States for student dashboard
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [completedSubmissions, setCompletedSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for educator dashboard
  const [studentPerformance, setStudentPerformance] = useState({ avgGrade: "", improvementAreas: [] });
  const [loadingPerformance, setLoadingPerformance] = useState(true);

  useEffect(() => {
    if (role === "student") {
      fetchStudentDashboard();
    } else if (role === "educator") {
      fetchEducatorDashboard();
    }
  }, [role, user]);

  // Fetch student-specific dashboard data
  const fetchStudentDashboard = async () => {
    try {
      // const [pendingResponse, completedResponse] = await Promise.all([
      //   axios.get(`http://localhost:8000/pending-submissions?email=${user}`),
      //   axios.get(`http://localhost:8000/completed-submissions?email=${user}`)
      // ]);
      // setPendingSubmissions(pendingResponse.data);
      // setCompletedSubmissions(completedSubmissions.data);
      // pendingResponse.data = null;
      // completedResponse.data = null;
      setPendingSubmissions(["Essay 1", "Research Paper", "Assignment 3"]);
      setCompletedSubmissions([
        { title: "Assignment 1", grade: "85%", feedback: "Well-written, but improve references." },
        { title: "Assignment 2", grade: "90%", feedback: "Great analysis, minor grammar issues." }
      ]);
    } catch (err) {
      setError("Failed to fetch dashboard data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch educator-specific dashboard data
  const fetchEducatorDashboard = async () => {
    try {
      // const response = await axios.get("http://localhost:8000/student-performance");
      // setStudentPerformance(response.data);
      setStudentPerformance({
        avgGrade: "82%",
        improvementAreas: ["Citations", "Conclusion Strength", "Grammar"],
      });
    } catch (err) {
      setError("Failed to fetch performance data.");
      console.error(err);
    } finally {
      setLoadingPerformance(false);
    }
  };

  return (
    <div>
      <h2>Welcome to Your Dashboard</h2>

      {/* Show errors if any */}
      {error && <p style={styles.error}>{error}</p>}

      {/* Student Dashboard View */}
      {role === "student" && (
        <div>
          <h3>Pending Submissions</h3>
          {loading ? (
            <p>Loading...</p>
          ) : pendingSubmissions.length > 0 ? (
            <ul>
              {pendingSubmissions.map((task, index) => (
                // <li key={index}>{task.title}</li>
                <li key={index}>{task}</li>
              ))}
            </ul>
          ) : (
            <p>No pending tasks.</p>
          )}

          <h3>Completed Submissions</h3>
          {loading ? (
            <p>Loading...</p>
          ) : completedSubmissions.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Grade</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {completedSubmissions.map((submission, index) => (
                  <tr key={index}>
                    <td>{submission.title}</td>
                    <td>{submission.grade}</td>
                    <td>{submission.feedback || "No feedback yet"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No completed submissions yet.</p>
          )}
        </div>
      )}

      {/* Educator Dashboard View */}
      {role === "educator" && (
        <div>
          <h3>Class Performance Summary</h3>
          {loadingPerformance ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>Average Class Grade: <strong>{studentPerformance.avgGrade}</strong></p>
              <h3>Areas for Improvement</h3>
              <ul>
                {studentPerformance.improvementAreas.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>

              <h3>Graphical Summary (Placeholder)</h3>
              <div style={styles.graphPlaceholder}>
                <p>[Performance Graph will be displayed here]</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  error: {
    color: "red",
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
    marginTop: "10px",
  },
};

export default Dashboard;
