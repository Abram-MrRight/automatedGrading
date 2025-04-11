import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Grades = () => {
  const { user } = useContext(AuthContext);
  const [grades, setGrades] = useState([{assignment: 'Assignment X', grade: '88', feedback: 'nks'}]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/grades?email=${user}`);
        setGrades(response.data);
      } catch (err) {
        setError("Failed to fetch grades.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [user]);

  return (
    <div>
      <h2>Your Grades</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {grades.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Grade</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, index) => (
              <tr key={index}>
                <td>{grade.assignment}</td>
                <td>{grade.grade}</td>
                <td>{grade.feedback || "No feedback yet"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No grades available.</p>
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
};

export default Grades;
