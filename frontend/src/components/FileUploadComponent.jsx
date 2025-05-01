const FileUploadComponent = ({ label, onChange, accept, styles }) => {
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <label>{label}</label><br />
      <input type="file" accept={accept} onChange={handleFileChange} style={styles} />
    </div>
  );
};

export default FileUploadComponent;
