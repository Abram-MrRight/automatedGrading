import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Student from "./Student";
import Papa from "papaparse"; // CSV parser

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:8000/students/");
      setStudents(response.data);
    } catch (error) {
      toast.error("Failed to fetch students ❌");
      console.error(error);
      
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = (event) => {
    setCsvFile(event.target.files[0]);
  };

  const uploadCsv = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file ❌");
      return;
    }

    setUploading(true);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const { data } = result;

          if (data.length === 0) {
            toast.error("CSV file is empty ❌");
            setUploading(false);
            return;
          }

          const response = await axios.post("http://localhost:8000/students/bulk-upload/", data, {
            headers: { "Content-Type": "application/json" },
          });

          setStudents([...students, ...response.data]);
          toast.success(`${response.data.length} students uploaded successfully ✅`);
          setCsvFile(null);
        } catch (error) {
          toast.error("Failed to upload students ❌");
          console.error(error);
        } finally {
          setUploading(false);
        }
      },
    });
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick />

      <div style={styles.header}>
        <h2>Students</h2>
        <input
          type="text"
          placeholder="Search by Name, Reg Number, Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchBox}
        />
      </div>

      {/* CSV Upload Section */}
      <div style={styles.uploadSection}>
        <h3>Add New Students</h3>
        <div>
          <input type="file" accept=".csv" onChange={handleCsvUpload} style={styles.fileInput} />
          <button onClick={uploadCsv} disabled={uploading} style={styles.uploadButton}>
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={styles.list}>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <Student key={student.id} student={student} />
            ))
          ) : (
            <p>No students found.</p>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "20px", maxWidth: "800px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  searchBox: { padding: "8px", width: "300px", borderRadius: "5px", border: "1px solid #ddd" },
  uploadSection: { display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "15px" },
  fileInput: { padding: "8px", border: "1px solid #ddd" },
  uploadButton: { backgroundColor: "#3498db", color: "white", padding: "10px", border: "none", cursor: "pointer" },
  list: { display: "grid", gap: "10px" },
};

export default Students;
