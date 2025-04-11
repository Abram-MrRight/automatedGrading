import { useState } from "react";

const Submission = () => {
  const [activeTab, setActiveTab] = useState("submit");
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [availableAssignments] = useState([
    { title: "Math Assignment 1", file: "math1.pdf" },
    { title: "Physics Homework", file: "physics_hw.pdf" },
  ]);

  const handleSubmit = () => {
    if (!assignmentFile) {
      alert("Please select a file to submit.");
      return;
    }
    alert(`Assignment "${assignmentFile.name}" submitted successfully!`);
    setAssignmentFile(null);
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
          <input type="file" onChange={(e) => setAssignmentFile(e.target.files[0])} style={styles.input} />
          <button onClick={handleSubmit} style={styles.uploadButton}>Submit</button>
        </div>
      ) : (
        <div>
          <h3>Available Assignments</h3>
          <ul>
            {availableAssignments.map((assignment, index) => (
              <li key={index}>
                {assignment.title} - <a href={`/${assignment.file}`} download>Download</a>
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
