import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Feedback = () => {
  const { user } = useContext(AuthContext);
  const [feedbacks, setFeedbacks] = useState([{ assignment: 'Assignment X', comment: 'Blah blah blah' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/feedback?email=${user}`);
        setFeedbacks(response.data);
      } catch (err) {
        setError("Failed to fetch feedback.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [user]);

  return (
    <div>
      <h2>Assignment Feedback</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {feedbacks.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback, index) => (
              <tr key={index}>
                <td>{feedback.assignment}</td>
                <td>{feedback.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No feedback available.</p>
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
    textAlign: "left",
  },
  error: {
    color: "red",
  },
};

export default Feedback;
