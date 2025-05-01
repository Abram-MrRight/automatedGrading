import { useState, useEffect } from "react";
import Axios from "../utils/Axios";

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingGradeId, setUpdatingGradeId] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [plagiarismReports, setPlagiarismReports] = useState([]);


  useEffect(() => {
    fetchGrades();
    fetchPlagiarismReports();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await Axios.get("grading-review-requests/");
      setReviews(response.data);
    } catch (err) {
      setError("Failed to fetch submissions.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlagiarismReports = async () => {
    try {
      const response = await Axios.get("plagiarism-reports/");
      setPlagiarismReports(response.data);
    } catch (err) {
      console.error("Failed to fetch plagiarism reports:", err);
    }
  };

  const handleView = (grade) => {
    const fileUrl = grade.submission_file_url;
    if (fileUrl) {
      window.open(`http://localhost:8000${fileUrl}`, "_blank");
    } else {
      alert("No submission file available.");
    }
  };  

  const handleAdjustGrade = async (id) => {
    console.log(reviews);
    const newGrade = prompt("Enter new grade for this submission:");
    if (!newGrade) return;

    setUpdatingGradeId(id);
    setNotification({ message: "", type: "" });

    try {
      await Axios.put(`gradings/${id}/update-grade/`, { grade: newGrade });

      setReviews((prev) =>
        prev.map((grade) =>
          grade.id === id ? { ...grade, grade: newGrade } : grade
        )
      );
      setNotification({ message: "Grade updated successfully!", type: "success" });
    } catch (err) {
      setNotification({ message: "Failed to update grade.", type: "error" });
      console.error(err);
    } finally {
      setUpdatingGradeId(null);
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    }
  };

  return (
    <div>
      <h2>Review Submissions</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {notification.message && (
        <div
          style={{
            ...styles.notification,
            backgroundColor: notification.type === "success" ? "#2ecc71" : "#e74c3c",
          }}
        >
          {notification.message}
        </div>
      )}

      {!loading && reviews.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Assignment</th>
              <th>AI Grade</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((grade) => (
              <tr key={grade.id}>
                <td>{grade.student_name || "N/A"}</td>
                <td>{grade.exam_name || "Untitled Exam"}</td>
                <td>{grade.grade || "Pending"}</td>
                <td>
                  <button
                    style={styles.viewButton}
                    onClick={() => handleView(grade)}
                  >
                    View Submission
                  </button>
                  <button
                    style={styles.adjustButton}
                    onClick={() => handleAdjustGrade(grade.id)}
                    disabled={updatingGradeId === grade.id}
                  >
                    {updatingGradeId === grade.id ? "Updating..." : "Adjust Grade"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No pending review requests.</p>
      )}
      <h2>Plagiarism Reports</h2>
        {plagiarismReports.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Source Student</th>
                <th>Compared To</th>
                <th>Similarity</th>
                <th>Flagged?</th>
                <th>Checked On</th>
              </tr>
            </thead>
            <tbody>
              {plagiarismReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.exam_title}</td>
                  <td>{report.source_student}</td>
                  <td>{report.compared_student}</td>
                  <td>{report.similarity_score.toFixed(2)}%</td>
                  <td style={{ color: report.is_flagged ? 'red' : 'green' }}>
                    {report.is_flagged ? 'Yes' : 'No'}
                  </td>
                  <td>{new Date(report.checked_on).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No plagiarism reports available.</p>
        )}
    </div>
  );
};

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  error: {
    color: "red",
  },
  viewButton: {
    padding: "8px",
    marginRight: "5px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  adjustButton: {
    padding: "8px",
    backgroundColor: "#e67e22",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  notification: {
    padding: "10px",
    color: "white",
    textAlign: "center",
    marginBottom: "10px",
    borderRadius: "5px",
  },
};

export default Review;
