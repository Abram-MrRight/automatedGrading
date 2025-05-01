import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Axios from "../utils/Axios";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const Dashboard = () => {
  const { role, user } = useContext(AuthContext);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [educatorLoading, setEducatorLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (role === "student") fetchStudentDashboard();
    if (role === "educator") fetchEducatorDashboard();
  }, [role, user]);

  const fetchStudentDashboard = async () => {
    setStudentLoading(true);
    try {
      const response = await Axios.get(`/students/${user.id}/dashboard/`);
      setDashboardStats(response.data);
    } catch (err) {
      setError("Failed to fetch student analytics data.");
      console.error(err);
    } finally {
      setStudentLoading(false);
    }
  };

  const fetchEducatorDashboard = async () => {
    setEducatorLoading(true);
    try {
      const res = await Axios.get("reports/");
      setAnalytics(res.data);
      const response2 = await Axios.get(`educator/`);
      setStudentPerformance(response2.data);
    } catch (err) {
      setError("Failed to fetch educator dashboard data.");
      console.error(err);
    } finally {
      setEducatorLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>📊 Welcome to Your Dashboard</h2>
      {error && <p style={styles.error}>{error}</p>}

      {/* === Student View === */}
      {role === "student" && dashboardStats && (
        <>
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>📘 Student Summary</h3>
            {studentLoading ? (
              <p>Loading...</p>
            ) : (
              <div style={styles.grid}>
                {[
                  ["Courses Enrolled", dashboardStats.courses],
                  ["Exams", dashboardStats.exams],
                  ["Submitted", dashboardStats.submitted],
                  ["Submitted On Time", dashboardStats.on_time],
                  ["Submitted Late", dashboardStats.late],
                  ["Average Score", dashboardStats.average_score],
                  ["Review Requests", dashboardStats.review_requests],
                  ["Plagiarism Flags", dashboardStats.plagiarism_flags],
                ].map(([label, value], i) => (
                  <div key={i} style={styles.statBox}>
                    <strong>{label}</strong>
                    <p>{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>📄 Recent Grades</h3>
            {dashboardStats.recent_grades?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Grade</th>
                    <th>Score</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardStats.recent_grades.map((grade, index) => (
                    <tr key={index}>
                      <td>{grade.exam}</td>
                      <td>{grade.grade}</td>
                      <td>{grade.score}</td>
                      <td>{grade.feedback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No recent grades found.</p>
            )}
          </div>
        </>
      )}

      {/* === Educator View === */}
      {role === "educator" && (
        <>
          {educatorLoading || !analytics ? (
            <p>Loading educator analytics...</p>
          ) : (
            <>
              <div style={styles.gridContainer}>
                <div style={styles.card}>
                  <h3 style={styles.sectionTitle}>📈 Grading Trends</h3>
                  {analytics.grading_trends?.length > 0 && (
                    <Bar
                      data={{
                        labels: analytics.grading_trends.map((t) => t.month),
                        datasets: [{
                          label: "Average Score",
                          data: analytics.grading_trends.map((t) => t.average_score),
                          backgroundColor: "#3498db",
                        }]
                      }}
                    />
                  )}
                </div>

                <div style={styles.card}>
                  <h3 style={styles.sectionTitle}>📚 Student Performance by Course</h3>
                  {analytics.course_performance?.length > 0 && (
                    <Line
                      data={{
                        labels: analytics.course_performance.map((c) => c.course),
                        datasets: [{
                          label: "Avg Score",
                          data: analytics.course_performance.map((c) => c.avg_score),
                          borderColor: "#2ecc71",
                          backgroundColor: "rgba(46,204,113,0.4)",
                          tension: 0.4
                        }]
                      }}
                    />
                  )}
                </div>

                <div style={styles.card}>
                  <h3 style={styles.sectionTitle}>🧠 AI Grading Accuracy</h3>
                  <Doughnut
                    data={{
                      labels: ["AI Grading", "Manual Grading"],
                      datasets: [{
                        label: "Grades Count",
                        data: [
                          analytics.ai_grading_count || 0,
                          analytics.manual_grading_count || 0,
                        ],
                        backgroundColor: ["#9b59b6", "#f39c12"]
                      }]
                    }}
                  />
                  <p style={{ marginTop: "15px" }}>
                    <strong>Average Deviation:</strong> {analytics.average_deviation ?? "N/A"}%
                  </p>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.sectionTitle}>❗ Common Student Mistakes</h3>
                  <ul>
                    {analytics.common_mistakes?.length > 0 ? (
                      analytics.common_mistakes.map((mistake, index) => (
                        <li key={index}>{mistake}</li>
                      ))
                    ) : (
                      <li>No common mistakes recorded.</li>
                    )}
                  </ul>
                </div>
              </div>
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>📊 Educator Insights</h3>
                <div style={styles.grid}>
                  {[
                    ["Courses Created", studentPerformance.total_courses],
                    ["Exams Created", studentPerformance.total_exams],
                    ["Submissions Received", studentPerformance.total_submissions],
                    ["Unique Students", studentPerformance.unique_students],
                    ["Average Score", studentPerformance.average_score],
                    ["Review Requests", studentPerformance.review_requests],
                    ["AI Graded", studentPerformance.ai_graded_count],
                    ["Manually Graded", studentPerformance.manual_graded_count],
                    ["AI Grade Adjustments", analytics?.grade_adjustments],
                    ["Plagiarism Flags", studentPerformance.plagiarism_flags],
                  ].map(([label, value], i) => (
                    <div key={i} style={styles.statBox}>
                      <strong>{label}</strong>
                      <p>{value ?? "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  pageTitle: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },  
  sectionTitle: {
    marginBottom: "10px",
    borderBottom: "2px solid #ccc",
    paddingBottom: "5px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    marginBottom: "25px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
  },
  statBox: {
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    textAlign: "center",
    border: "1px solid #e0e0e0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
};

export default Dashboard;
