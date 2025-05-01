import { useState, useEffect } from "react";
import Axios from "../utils/Axios";
import ExamModal from "../components/ExamModal";
import { ToastContainer, toast } from "react-toastify";

const ManageExams = () => {
  const [courses, setCourses] = useState([]);
  const [uploadedExams, setUploadedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [plagiarismRunning, setPlagiarismRunning] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchExams();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await Axios.get("courses/");
      setCourses(response.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await Axios.get("exams/");
      const exams = response.data;

      const markingGuides = await Axios.get("marking_guides/");
      const guideMap = markingGuides.data.reduce((acc, guide) => {
        acc[guide.exam] = guide;
        return acc;
      }, {});

      const examsWithGuides = exams.map((exam) => ({
        ...exam,
        marking_guide: guideMap[exam.id] || null,
      }));

      setUploadedExams(examsWithGuides);
    } catch (err) {
      setError("Failed to fetch exams.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (form) => {
    const isEditing = !!editingExam;
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      setUploading(true);
      let response;

      if (isEditing) {
        response = await Axios.put(`exams/${editingExam.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await Axios.post("exams/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const updatedExam = response.data;

      if (form.marking_guide_file) {
        const guideForm = new FormData();
        guideForm.append("exam", updatedExam.id);
        guideForm.append("marking_guide_file", form.marking_guide_file);
        guideForm.append("grading_type", form.grading_type || "fair");

        const guideRes = await Axios.post("marking_guides/", guideForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        updatedExam.marking_guide = guideRes.data;
      }

      if (isEditing) {
        setUploadedExams((prev) =>
          prev.map((e) => (e.id === updatedExam.id ? updatedExam : e))
        );
      } else {
        setUploadedExams((prev) => [...prev, updatedExam]);
      }

      setModalVisible(false);
      setEditingExam(null);
    } catch (err) {
      console.error("Upload/Update Error", err);
      setUploadError("Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (exam) => {
    const confirm = window.confirm(
      `Are you sure you want to delete the exam "${exam.title}" and its marking guide?`
    );
    if (!confirm) return;

    try {
      if (exam.marking_guide?.id) {
        await Axios.delete(`marking_guides/${exam.marking_guide.id}/`);
      }

      await Axios.delete(`exams/${exam.id}/`);
      setUploadedExams((prev) => prev.filter((e) => e.id !== exam.id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete exam or marking guide.");
    }
  };

  const handleRunPlagiarism = async (examId) => {
    if (!window.confirm("Run plagiarism check for this exam?")) return;
  
    setPlagiarismRunning(examId);
  
    try {
      await Axios.post(`exams/${examId}/plagiarism-check/`);
      toast.success("Plagiarism check complete ✅");
    } catch (error) {
      toast.error("Failed to run plagiarism check ❌");
      console.error(error);
    } finally {
      setPlagiarismRunning(null);
    }
  };
  

  return (
    <div>
      <h2>Manage Exams</h2>

      <button
        onClick={() => {
          setEditingExam(null);
          setModalVisible(true);
        }}
        style={styles.uploadButton}
      >
        + Upload New Exam
      </button>

      {uploadError && <p style={styles.error}>{uploadError}</p>}

      <h3>Uploaded Exams</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : uploadedExams.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Exam File</th>
              <th>Marking Guide</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {uploadedExams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.title}</td>
                <td>{exam.description}</td>
                <td>
                  {exam.exam_file ? (
                    <a href={`http://localhost:8000${exam.exam_file}`} download>
                      {exam.exam_file.split("/").pop()}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  {exam.marking_guide?.marking_guide_file ? (
                    <a
                      href={`http://localhost:8000${exam.marking_guide.marking_guide_file}`}
                      download
                    >
                      {exam.marking_guide.marking_guide_file.split("/").pop()}
                    </a>
                  ) : (
                    <span style={styles.unavailable}>Unavailable</span>
                  )}
                </td>
                <td>
                  <button
                    style={styles.editButton}
                    onClick={() => {
                      setEditingExam(exam);
                      setModalVisible(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDelete(exam)}
                  >
                    Delete
                  </button>
                  <button
                    style={styles.plagiarismButton}
                    onClick={() => handleRunPlagiarism(exam.id)}
                    disabled={plagiarismRunning === exam.id}
                  >
                    {plagiarismRunning === exam.id ? "Checking..." : "Run Plagiarism Check"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No exams uploaded yet.</p>
      )}

      <ExamModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleUpload}
        courses={courses}
        initialData={editingExam}
        loading={uploading}
      />
    </div>
  );
};

const styles = {
  uploadButton: {
    padding: "10px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginBottom: "15px",
  },
  editButton: {
    marginRight: "8px",
    padding: "6px 10px",
    backgroundColor: "#2980b9",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "6px 10px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "4px",
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
  plagiarismButton: {
    padding: "6px 10px",
    backgroundColor: "#9b59b6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "8px",
    transition: "background-color 0.3s",
  },
  plagiarismButtonHover: {
    backgroundColor: "#8e44ad"
  } 
};

export default ManageExams;
