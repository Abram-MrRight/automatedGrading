import { useState, useEffect } from "react";
// import axios from "axios";

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // const response = await axios.get("http://localhost:8000/reports");
      // setAnalytics(response.data);
      setAnalytics({
        gradingTrends: [
          { month: "Jan", avgGrade: "78%" },
          { month: "Feb", avgGrade: "82%" },
          { month: "Mar", avgGrade: "85%" },
          { month: "Apr", avgGrade: "87%" },
        ],
        studentPerformance: [
          { subject: "Mathematics", avgScore: "80%" },
          { subject: "History", avgScore: "75%" },
          { subject: "Computer Science", avgScore: "90%" },
          { subject: "Physics", avgScore: "85%" },
        ],
        aiAccuracy: {
          aiGrading: "89%",
          humanGrading: "91%",
          deviation: "2%",
        },
        commonMistakes: [
          "Incorrect citations",
          "Weak thesis statements",
          "Grammatical errors",
          "Poor argument structure",
        ],
      })
    } catch (err) {
      setError("Failed to fetch reports.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Grading & Performance Reports</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && analytics && (
        <>
          {/* Grading Trends */}
          <h3>Grading Trends Over Time</h3>
          <div style={styles.graphPlaceholder}>
            <p>[Graph: Average Grades per Month]</p>
          </div>
          <ul>
            {analytics.gradingTrends.map((trend, index) => (
              <li key={index}>
                <strong>{trend.month}:</strong> {trend.avgGrade}
              </li>
            ))}
          </ul>

          {/* Student Performance Breakdown */}
          <h3>Student Performance by Subject</h3>
          <div style={styles.graphPlaceholder}>
            <p>[Graph: Student Performance by Subject]</p>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Average Score</th>
              </tr>
            </thead>
            <tbody>
              {analytics.studentPerformance.map((subject, index) => (
                <tr key={index}>
                  <td>{subject.subject}</td>
                  <td>{subject.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* AI Accuracy */}
          <h3>AI Grading Accuracy</h3>
          <p>AI-assigned grades: <strong>{analytics.aiAccuracy.aiGrading}</strong></p>
          <p>Human-assigned grades: <strong>{analytics.aiAccuracy.humanGrading}</strong></p>
          <p>Deviation: <strong>{analytics.aiAccuracy.deviation}</strong></p>

          {/* Common Mistakes */}
          <h3>Common Student Mistakes</h3>
          <ul>
            {analytics.commonMistakes.map((mistake, index) => (
              <li key={index}>{mistake}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

// Styles
const styles = {
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
    marginBottom: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    textAlign: "left",
  },
  error: {
    color: "red",
  },
};

export default Reports;
