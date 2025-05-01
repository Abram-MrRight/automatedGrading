import Axios from "../utils/Axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import FileUploadComponent from "../components/FileUploadComponent";

const Student = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updatedStudent, setUpdatedStudent] = useState({});
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await Axios.get(`students/${id}/`);
        setStudent(response.data);
        setUpdatedStudent(response.data);
      } catch (err) {
        console.error("Failed to load student:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleChange = (e) => {
    setUpdatedStudent({ ...updatedStudent, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setUpdatedStudent({ ...updatedStudent, profile_pic: e.target.files[0] });
  };

  const saveChanges = async () => {
    setSaving(true);
    const formData = new FormData();
    for (const key in updatedStudent) {
      if (updatedStudent[key] === undefined || updatedStudent[key] === null) continue;
      if (key === "courses" || key === "password") continue;
      formData.append(key, updatedStudent[key]);
    }

    try {
      await Axios.put(`students/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStudent({ ...updatedStudent });
      setEditing(false);
      toast.success("Profile updated ✅");
    } catch (err) {
      const errorData = err.response?.data || err.message;
      toast.error("Failed to update student ❌");
      console.error("Update Error Details:", errorData);
    } finally {
      setSaving(false);
    }
  };

  const deleteStudent = async () => {
    try {
      await Axios.delete(`students/${id}/`);
      toast.success("Student deleted ✅");
      setTimeout(() => navigate("/students"), 1000);
    } catch (err) {
      toast.error("Failed to delete student ❌");
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!student) return <p>Student not found.</p>;

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <img
        src={
          updatedStudent.profile_pic instanceof File
            ? URL.createObjectURL(updatedStudent.profile_pic)
            : updatedStudent.profile_pic || "/default-avatar.png"
        }
        alt={updatedStudent.name}
        style={styles.image}
      />

      {editing && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit Student</h3>
            <input style={styles.input} type="text" name="name" value={updatedStudent.name} onChange={handleChange} placeholder="Name" />
            <input style={styles.input} type="text" name="regNumber" value={updatedStudent.regNumber} onChange={handleChange} placeholder="Reg Number" />
            <input style={styles.input} type="number" name="age" value={updatedStudent.age} onChange={handleChange} placeholder="Age" />
            <input style={styles.input} type="email" name="email" value={updatedStudent.email} onChange={handleChange} placeholder="Email" />
            <input style={styles.input} type="text" name="username" value={updatedStudent.username} onChange={handleChange} placeholder="Username" />
            <FileUploadComponent
              label="Select a new profile picture:"
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              styles={styles.input}
            />
            <div style={styles.buttonRow}>
              <button onClick={saveChanges} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.details}>
        <h2>{student.name}</h2>
        <table style={styles.table}>
          <tbody>
            <tr>
              <td><strong>Reg No:</strong></td>
              <td>{student.regNumber}</td>
            </tr>
            <tr>
              <td><strong>Age:</strong></td>
              <td>{student.age}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>{student.email}</td>
            </tr>
            <tr>
              <td><strong>Username:</strong></td>
              <td>{student.username}</td>
            </tr>
          </tbody>
        </table>

        <h4>Enrolled Courses</h4>
        <ul>
          {student.courses?.map((course) => (
            <li key={course.id}>{course.title}</li>
          ))}
        </ul>

        <div style={styles.buttonRow}>
          <button onClick={() => setEditing(true)}>Edit</button>
          <button style={styles.deleteButton} onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      {showConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h4>Are you sure you want to delete this student?</h4>
            <div style={styles.buttonRow}>
              <button style={styles.deleteButton} onClick={deleteStudent}>Yes, Delete</button>
              <button onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "5px",
    maxWidth: "500px",
    margin: "auto",
  },
  image: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
    margin: "0 auto",
  },
  details: {
    marginTop: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "10px",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    gap: "10px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "50px",
    borderRadius: "8px",
    width: "300px",
    textAlign: "center",
    boxShadow: "0 0 15px rgba(0,0,0,0.3)",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    fontSize: "14px",
    borderRadius: "8px",
  },
};

export default Student;
