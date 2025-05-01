import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Axios from "../utils/Axios";

const Submission = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("submit");
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [examId, setExamId] = useState("");
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await Axios.get("exams/");
      setAvailableAssignments(response.data);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    }
  };

  const handleSubmit = async () => {
    if (!assignmentFile || !examId) {
      alert("Please select an exam and file to submit.");
      return;
    }

    setUploading(true);
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("file", assignmentFile);
      formData.append("exam", examId);
      formData.append("student", user?.id);

      await Axios.post("upload-submission/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("Assignment submitted and graded successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Submission failed. Please try again.");
    } finally {
      setUploading(false);
      setAssignmentFile(null);
      setExamId("");
    }
  };

  return (
    <div>
      {activeTab === "submit" ? <h2>Submit Assignment</h2> : <h2>All Assignments</h2>}

      <div>
        <button onClick={() => setActiveTab("submit")} style={styles.tabButton}>Submit Assignment</button>
        <button onClick={() => setActiveTab("view")} style={styles.tabButton}>View Assignments</button>
      </div>

      {activeTab === "submit" ? (
        <div>
          <h3>Upload Your Assignment</h3>

          <select value={examId} onChange={(e) => setExamId(e.target.value)} style={styles.input}>
            <option value="">-- Select Assignment --</option>
            {availableAssignments.map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.title}</option>
            ))}
          </select>

          <input type="file" onChange={(e) => setAssignmentFile(e.target.files[0])} style={styles.input} />
          <button onClick={handleSubmit} style={styles.uploadButton} disabled={uploading}>
            {uploading ? "Submitting..." : "Submit"}
          </button>
          {status && <p>{status}</p>}
        </div>
      ) : (
        <div>
          <h3>Available Assignments</h3>
          <ul>
            {availableAssignments.map((assignment, index) => (
              <li key={index}>
                {assignment.title} -{" "}
                {assignment.exam_file ? (
                  <a href={`http://localhost:8000${assignment.exam_file}`} download>Download</a>
                ) : (
                  <span style={{ color: "gray" }}>No file</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  tabButton: {
    margin: "10px",
    padding: "8px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  input: {
    display: "block",
    marginBottom: "10px",
    padding: "8px",
    width: "300px",
  },
  uploadButton: {
    padding: "10px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default Submission;
