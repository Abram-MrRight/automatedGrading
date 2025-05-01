const OfflineNotice = () => {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h1>🚫 Backend Server Unreachable</h1>
          <p>Please make sure your Django backend is running at <code>http://localhost:8000</code>.</p>
          <p>Once the server is up, refresh the page.</p>
        </div>
      </div>
    );
  };
  
  const styles = {
    wrapper: {
      height: "100vh",
      backgroundColor: "#2c3e50",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Montserrat, sans-serif",
    },
    card: {
      textAlign: "center",
      color: "white",
      background: "#34495e",
      padding: "40px",
      borderRadius: "10px",
      boxShadow: "0 0 20px rgba(0,0,0,0.3)",
      maxWidth: "500px",
    }
  };
  
  export default OfflineNotice;
  