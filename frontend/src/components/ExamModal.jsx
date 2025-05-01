import { useState, useEffect } from "react";
import FileUploadComponent from "./FileUploadComponent";

const ExamModal = ({ isOpen, onClose, onSubmit, courses, initialData, loading }) => {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [examFile, setExamFile] = useState(null);
  const [markingGuideFile, setMarkingGuideFile] = useState(null);
  const [gradingType, setGradingType] = useState("fair");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCourseId(initialData.course || "");
      setDescription(initialData.description || "");
      setStartTime(initialData.start_time ? initialData.start_time.slice(0, 16) : "");
      setEndTime(initialData.end_time ? initialData.end_time.slice(0, 16) : "");
      setExamFile(null); // Keep null for edit; only send if updated
      setMarkingGuideFile(null);
      setGradingType(initialData.marking_guide?.grading_type || "fair");
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setTitle("");
    setCourseId("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setExamFile(null);
    setMarkingGuideFile(null);
  };

  const handleSubmit = () => {
    const formData = {
      title,
      course: courseId,
      description,
      start_time: startTime,
      end_time: endTime,
      exam_file: examFile,
      marking_guide_file: markingGuideFile,
      grading_type: gradingType,
    };

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{initialData ? "Edit Exam" : "Upload New Exam"}</h3>

        <input
          type="text"
          placeholder="Exam Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          style={styles.input}
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...styles.input, height: "80px" }}
        />

        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={styles.input}
        />

        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={styles.input}
        />

        <FileUploadComponent
          label="Select an EXAM file:"
          onChange={(file) => setExamFile(file)}
          accept=".pdf,.docx,.txt"
          styles={styles.input}
        />

        <FileUploadComponent
          label="Select a MARKING GUIDE file:"
          onChange={(file) => setMarkingGuideFile(file)}
          accept=".pdf,.docx,.txt"
          styles={styles.input}
        />

        <select
          value={gradingType}
          onChange={(e) => setGradingType(e.target.value)}
          style={styles.input}
        >
          <option value="fair">Fair Grading</option>
          <option value="lenient">Lenient Grading</option>
          <option value="strict">Strict Grading</option>
        </select>

        <div style={styles.actions}>
          <button
            onClick={handleSubmit}
            style={{ ...styles.button, backgroundColor: "#2ecc71" }}
            disabled={loading}
          >
            {loading ? "Saving..." : initialData ? "Save Changes" : "Upload"}
          </button>
          <button onClick={onClose} style={{ ...styles.button, backgroundColor: "#ccc", color: "#000" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
    boxShadow: "0 0 15px rgba(0,0,0,0.3)",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    fontSize: "14px",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  button: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    color: "#fff",
  },
};

export default ExamModal;
