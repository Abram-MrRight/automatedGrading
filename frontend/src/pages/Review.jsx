import { useState, useEffect } from "react";
import axios from "axios";

const Review = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingGrade, setUpdatingGrade] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // const response = await axios.get("http://localhost:8000/review-submissions");
      // setSubmissions(response.data);
      setSubmissions([
        { id: 1, student: "John Doe", title: "Essay on AI", status: "Pending", grade: "85%" },
        { id: 2, student: "Jane Smith", title: "Cybersecurity Report", status: "Pending", grade: "90%" },
      ])
    } catch (err) {
      setError("Failed to fetch submissions.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id) => {
    alert(`Viewing submission ID: ${id}`);
    // Replace this with navigation to a detailed review page
  };

  const handleAdjustGrade = async (id) => {
    const newGrade = prompt("Enter new grade for this submission:");
    if (!newGrade) return;

    setUpdatingGrade(true);
    setNotification({ message: "", type: "" });

    try {
      await axios.put(`http://localhost:8000/review-submissions/${id}`, { grade: newGrade });
      setSubmissions((prev) =>
        prev.map((submission) =>
          submission.id === id ? { ...submission, grade: newGrade } : submission
        )
      );
      setNotification({ message: "Grade updated successfully!", type: "success" });
    } catch (err) {
      setNotification({ message: "Failed to update grade. Please try again.", type: "error" });
      console.error(err);
    } finally {
      setUpdatingGrade(false);
      setTimeout(() => setNotification({ message: "", type: "" }), 3000); 
    }
  };

  return (
    <div>
      <h2>Review Submissions</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {/* Display Success/Error Notification */}
      {notification.message && (
        <div style={{ ...styles.notification, backgroundColor: notification.type === "success" ? "#2ecc71" : "#e74c3c" }}>
          {notification.message}
        </div>
      )}

      {!loading && submissions.length > 0 ? (
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
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.student}</td>
                <td>{submission.title}</td>
                <td>{submission.grade}</td>
                <td>
                  <button style={styles.viewButton} onClick={() => handleView(submission.id)}>
                    View Submission
                  </button>
                  <button style={styles.adjustButton} onClick={() => handleAdjustGrade(submission.id)} disabled={updatingGrade}>
                    {updatingGrade ? "Updating..." : "Adjust Grade"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No pending submissions.</p>
      )}
    </div>
  );
};

// Styles
const styles = {
  notification: {
    padding: "10px",
    color: "white",
    textAlign: "center",
    marginBottom: "10px",
    borderRadius: "5px",
  },
  adjustButton: {
    padding: "8px",
    backgroundColor: "#e67e22",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default Review;
