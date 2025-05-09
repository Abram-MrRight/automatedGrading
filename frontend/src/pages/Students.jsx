import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import Axios from "../utils/Axios";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await Axios.get("students/");
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

          const response = await Axios.post("students/bulk-upload/", data, {
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

  const filteredStudents = students.filter((student) =>
    (student.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.regNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.email || "").toLowerCase().includes(searchQuery.toLowerCase())
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
              <div key={student.id} style={styles.card}>
                <img
                  src={student.profile_pic || "/default-avatar.png"}
                  alt={student.name}
                  style={styles.image}
                />
                <h3>{student.name}</h3>
                <p>@{student.username}</p>
                <button
                  style={styles.viewButton}
                  onClick={() => navigate(`/student/${student.id}`)}
                >
                  View
                </button>
              </div>
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
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },  
  card: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    textAlign: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  image: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "10px",
  },
  viewButton: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px"
  },  
};

export default Students;
