import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Student = ({ student, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [updatedStudent, setUpdatedStudent] = useState({ ...student });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChange = (e) => {
    setUpdatedStudent({ ...updatedStudent, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setUpdatedStudent({ ...updatedStudent, profile_pic: e.target.files[0] });
  };

  const saveChanges = async () => {
    setSaving(true);

    const formData = new FormData();
    Object.keys(updatedStudent).forEach((key) => {
      formData.append(key, updatedStudent[key]);
    });

    try {
      await axios.put(`http://localhost:8000/students/${student.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Student details updated successfully! 🎉");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update student details. ❌");
      console.error(err);
      
    } finally {
      setSaving(false);
    }
  };

  const deleteStudent = async () => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);

    try {
      await axios.delete(`http://localhost:8000/students/${student.id}/`);
      toast.success("Student deleted successfully. ✅");
      onDelete(student.id); // Remove student from UI
    } catch (err) {
      toast.error("Failed to delete student. Try again. ❌");
      console.error(err);
      
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick />
      
      <img
        src={
          updatedStudent.profile_pic instanceof File
            ? URL.createObjectURL(updatedStudent.profile_pic)
            : updatedStudent.profile_pic || "default-avatar.png"
        }
        alt={updatedStudent.name}
        style={styles.image}
      />

      {editing ? (
        <div style={styles.form}>
          <input type="text" name="name" value={updatedStudent.name} onChange={handleChange} placeholder="Name" />
          <input type="text" name="regNumber" value={updatedStudent.regNumber} onChange={handleChange} placeholder="Reg Number" />
          <input type="number" name="age" value={updatedStudent.age} onChange={handleChange} placeholder="Age" />
          <input type="email" name="email" value={updatedStudent.email} onChange={handleChange} placeholder="Email" />
          <input type="text" name="username" value={updatedStudent.username} onChange={handleChange} placeholder="Username" />
          <input type="file" onChange={handleFileChange} />
          <button onClick={saveChanges} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div style={styles.details}>
          <h3>{updatedStudent.name}</h3>
          <p><strong>Reg No:</strong> {updatedStudent.regNumber}</p>
          <p><strong>Age:</strong> {updatedStudent.age}</p>
          <p><strong>Email:</strong> {updatedStudent.email}</p>
          <p><strong>Username:</strong> {updatedStudent.username}</p>
          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={deleteStudent} disabled={deleting} style={styles.deleteButton}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
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
    textAlign: "center",
    width: "250px",
  },
  image: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  form: {
    display: "grid",
    gap: "10px",
  },
  details: {
    marginTop: "10px",
  },
  deleteButton: {
    marginTop: "10px",
    backgroundColor: "#e74c3c",
    color: "white",
    padding: "8px",
    border: "none",
    cursor: "pointer",
  },
};

export default Student;
