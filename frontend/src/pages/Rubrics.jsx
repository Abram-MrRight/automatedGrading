import { useState, useEffect } from "react";
import axios from "axios";

const Rubrics = () => {
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [creatingRubric, setCreatingRubric] = useState(false);
  const [createError, setCreateError] = useState(null);


  useEffect(() => {
    fetchRubrics();
  }, []);

  const fetchRubrics = async () => {
    try {
      // const response = await axios.get("http://localhost:8000/rubrics");
      // setRubrics(response.data);
      setRubrics([
        { id: 1, name: "Clarity", weight: "20%" },
        { id: 2, name: "Structure", weight: "25%" },
        { id: 3, name: "Grammar", weight: "15%" },
        { id: 4, name: "Originality", weight: "40%" },
      ])
    } catch (err) {
      setError("Failed to fetch rubrics.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustRubric = async (id) => {
    const newWeight = prompt("Enter new weight percentage for this parameter:");
    if (!newWeight) return;

    try {
      await axios.put(`http://localhost:8000/rubrics/${id}`, { weight: `${newWeight}%` });
      setRubrics((prev) =>
        prev.map((rubric) =>
          rubric.id === id ? { ...rubric, weight: `${newWeight}%` } : rubric
        )
      );
    } catch (err) {
      alert("Failed to update rubric.");
      console.error(err);
    }
  };

  const handleCreateRubric = async () => {
    const newName = prompt("Enter the new rubric parameter name:");
    const newWeight = prompt("Enter weight percentage for this parameter:");
    if (!newName || !newWeight) return;

    setCreatingRubric(true);
    setCreateError(null);

    try {
      const response = await axios.post("http://localhost:8000/rubrics", {
        name: newName,
        weight: `${newWeight}%`,
      });
      setRubrics([...rubrics, response.data]);
    } catch (err) {
      setCreateError("Failed to create rubric. Please try again.");
      console.error(err);
    } finally {
      setCreatingRubric(false);
    }
  };

  return (
    <div>
      <h2>Manage Rubrics</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : rubrics.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Weight</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rubrics.map((rubric) => (
              <tr key={rubric.id}>
                <td>{rubric.name}</td>
                <td>{rubric.weight}</td>
                <td>
                  <button style={styles.adjustButton} onClick={() => handleAdjustRubric(rubric.id)}>
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No rubric parameters available.</p>
      )}

      {/* Error message */}
      {createError && <p style={styles.error}>{createError}</p>}

      {/* Create New Rubric Button */}
      <button style={styles.createButton} onClick={handleCreateRubric} disabled={creatingRubric}>
        {creatingRubric ? "Creating..." : "Create New Rubric"}
      </button>

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
  adjustButton: {
    padding: "8px",
    backgroundColor: "#e67e22",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  createButton: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
};

export default Rubrics;
