import { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", selectedCourseId: "" });
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role === "educator") {
      fetchCourses();
    } else if (role === "student") {
      fetchStudentCourses();
      fetchAvailableCourses();
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await Axios.get("courses/");
      console.log(response.data);
      
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to fetch courses ❌");
      console.error(error);
    }
  };

  const fetchStudentCourses = async () => {
    try {
      const response = await Axios.get("courses/student/");
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to fetch your courses ❌");
      console.error(error);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await Axios.get("courses/all/");
      setAvailableCourses(response.data);
    } catch (error) {
      console.error("Failed to fetch available courses", error);
    }
  };

  const handleOpenModal = () => {
    setForm({ title: "", description: "", selectedCourseId: "" });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setForm({ title: "", description: "", selectedCourseId: "" });
    setModalVisible(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (role === "educator") {
        if (!form.title || !form.description) {
          toast.error("All fields are required.");
          return;
        }
        const payload = {
          ...form,
          created_by: user?.id,
        };

        const response = await Axios.post("courses/", payload);
        setCourses((prev) => [...prev, response.data]);
        toast.success("Course added successfully ✅");
      } else if (role === "student") {
        if (!form.selectedCourseId) {
          toast.error("Please select a course to enroll.");
          return;
        }
        await Axios.post(`courses/${form.selectedCourseId}/enroll/`);
        fetchStudentCourses();
        toast.success("Enrolled successfully ✅");
      }

      handleCloseModal();
    } catch (error) {
      toast.error("Failed to process your request ❌");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await Axios.post(`courses/${courseId}/unenroll/`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success("Unenrolled successfully ✅");
    } catch (error) {
      toast.error("Failed to unenroll ❌");
      console.error(error);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await Axios.delete(`courses/${courseId}/`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success("Course deleted ✅");
    } catch (error) {
      toast.error("Failed to delete course ❌");
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div style={styles.header}>
        <h2>Courses</h2>
        <button style={styles.addButton} onClick={handleOpenModal}>
          {role === "educator" ? "+ Add Course" : "+ Enroll for a Course"}
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th style={{ width: "160px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.length > 0 ? (
            courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td style={styles.descriptionCell}>{course.description}</td>
                <td>
                  {role === "educator" ? (
                    <button style={styles.deleteButton} onClick={() => handleDelete(course.id)}>Delete</button>
                  ) : (
                    <button style={styles.unenrollButton} onClick={() => handleUnenroll(course.id)}>Unenroll</button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No courses found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {modalVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>{role === "educator" ? "Add New Course" : "Enroll in a Course"}</h3>
            {role === "educator" ? (
              <>
                <input
                  type="text"
                  name="title"
                  placeholder="Course Title"
                  value={form.title}
                  onChange={handleChange}
                  style={styles.input}
                />
                <textarea
                  name="description"
                  placeholder="Course Description"
                  value={form.description}
                  onChange={handleChange}
                  style={styles.textarea}
                />
              </>
            ) : (
              <select
                name="selectedCourseId"
                value={form.selectedCourseId}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Course to Enroll</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            )}
            <div style={styles.modalActions}>
              <button onClick={handleSubmit} disabled={loading} style={styles.saveButton}>
                {loading ? "Processing..." : role === "educator" ? "Add Course" : "Enroll"}
              </button>
              <button onClick={handleCloseModal} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px"
  },
  addButton: {
    marginBottom: "10px",
    padding: "8px 12px",
    backgroundColor: "#27ae60",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },
  descriptionCell: {
    whiteSpace: "normal",
    wordWrap: "break-word",
    maxWidth: "400px",
  },
  deleteButton: {
    padding: "6px 10px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  unenrollButton: {
    padding: "6px 10px",
    backgroundColor: "#f39c12",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    boxShadow: "0 0 15px rgba(0,0,0,0.2)",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    fontSize: "16px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    height: "100px",
    marginBottom: "10px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#2ecc71",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#000",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
  },
};

export default Courses;
