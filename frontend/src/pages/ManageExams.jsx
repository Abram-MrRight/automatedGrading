import { useState, useEffect } from "react";
import axios from "axios";
import FileUploadComponent from "../components/FileUploadComponent";

const ManageExams = () => {
  const [examTitle, setExamTitle] = useState("");
  const [examFile, setExamFile] = useState(null);
  const [markingGuideFile, setMarkingGuideFile] = useState(null);
  const [uploadedExams, setUploadedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get("http://localhost:8000/exams");
      setUploadedExams(response.data);
    } catch (err) {
      setError("Failed to fetch exams.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!examTitle || !examFile) {
      setUploadError("Please provide an exam title and select an exam file.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("title", examTitle);
    formData.append("exam_file", examFile);

    try {
      const examResponse = await axios.post("http://localhost:8000/exams", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      let updatedExam = examResponse.data;

      // If a marking guide is provided, upload it
      if (markingGuideFile) {
        const markingFormData = new FormData();
        markingFormData.append("exam_id", updatedExam.id);
        markingFormData.append("marking_guide_file", markingGuideFile);

        const markingGuideResponse = await axios.post("http://localhost:8000/marking-guides", markingFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        updatedExam.marking_guide = markingGuideResponse.data;
      }

      setUploadedExams([...uploadedExams, updatedExam]);
      setExamTitle("");
      setExamFile(null);
      setMarkingGuideFile(null);
    } catch (err) {
      setUploadError("Failed to upload exam. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Manage Exams</h2>

      {/* Upload Section */}
      <h3>Upload a New Exam</h3>
      <input
        type="text"
        placeholder="Exam Title"
        value={examTitle}
        onChange={(e) => setExamTitle(e.target.value)}
        style={styles.input}
      />
      <FileUploadComponent
        label="Select an EXAM file:"
        onChange={(e) => setExamFile(e.target.files[0])}
        accept=".pdf,.docx,.txt"
        styles={styles.input}
      />
      <FileUploadComponent
        label="Select a MARKING GUIDE file:"
        onChange={(e) => setMarkingGuideFile(e.target.files[0])}
        accept=".pdf,.docx,.txt"
        styles={styles.input}
      />
      <button onClick={handleUpload} style={styles.uploadButton} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Exam & Marking Guide"}
      </button>
      {uploadError && <p style={styles.error}>{uploadError}</p>}

      {/* Uploaded Exams */}
      <h3>Uploaded Exams</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : uploadedExams.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Exam Title</th>
              <th>Exam File</th>
              <th>Marking Guide</th>
            </tr>
          </thead>
          <tbody>
            {uploadedExams.map((exam, index) => (
              <tr key={index}>
                <td>{exam.title}</td>
                <td>
                  <a href={exam.fileUrl} download>
                    {exam.fileName || "Download"}
                  </a>
                </td>
                <td>
                  {exam.marking_guide ? (
                    <a href={exam.marking_guide.fileUrl} download>
                      {exam.marking_guide.fileName || "Download"}
                    </a>
                  ) : (
                    <span style={styles.unavailable}>Unavailable</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No exams available.</p>
      )}
    </div>
  );
};

// Styles
const styles = {
  input: {
    // display: "block",
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
  error: {
    color: "red",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  unavailable: {
    color: "red",
    fontStyle: "italic",
  },
};

export default ManageExams;
