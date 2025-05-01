import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Axios from "../utils/Axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Grades = () => {
  const { user } = useContext(AuthContext);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState("");

  useEffect(() => {
    fetchGrades();
  }, [user]);

  const fetchGrades = async () => {
    try {
      if (!user?.id) {
        setError("User ID not available.");
        setLoading(false);
        return;
      }

      const response = await Axios.get(`grading-report/?student_id=${user.id}`);
      setGrades(response.data);
    } catch (err) {
      setError("Failed to fetch grades.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (gradingId) => {
    try {
      await Axios.post(`/gradings/${gradingId}/request-review/`);
      toast.success("Manual review requested ✅");

      // Update UI
      setGrades((prevGrades) =>
        prevGrades.map((grade) =>
          grade.id === gradingId ? { ...grade, review_requested: true } : grade
        )
      );
    } catch (err) {
      toast.error("Could not request review ❌");
      console.error(err);
    }
  };

  const openFeedbackModal = (feedback) => {
    setSelectedFeedback(feedback);
    setModalOpen(true);
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h2>Your Grades</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {grades.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Grade</th>
              <th>Score (%)</th>
              <th>Feedback</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td>{grade.exam_name}</td>
                <td>{grade.grade}</td>
                <td>{grade.grade_score}</td>
                <td>
                  {grade.comments ? (
                    <button onClick={() => openFeedbackModal(grade.comments)} style={styles.viewButton}>
                      View Feedback
                    </button>
                  ) : (
                    "No feedback"
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleReviewRequest(grade.id)}
                    disabled={grade.review_requested}
                    style={grade.review_requested ? styles.disabledButton : styles.reviewButton}
                  >
                    {grade.review_requested ? "Review Requested" : "Request Review"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No grades available.</p>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Feedback</h3>
            <p style={styles.feedbackText}>{selectedFeedback}</p>
            <button onClick={() => setModalOpen(false)} style={styles.closeButton}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  error: {
    color: "red",
  },
  reviewButton: {
    padding: "6px 10px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  disabledButton: {
    padding: "6px 10px",
    backgroundColor: "#aaa",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "not-allowed",
  },
  viewButton: {
    padding: "6px 10px",
    backgroundColor: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    width: "500px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },
  feedbackText: {
    maxHeight: "300px",
    overflowY: "auto",
    whiteSpace: "pre-wrap",
    marginBottom: "15px",
  },
  closeButton: {
    padding: "8px 12px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Grades;
