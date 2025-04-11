const NotFound = () => {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>404 - Page Not Found</h1>
        <p style={styles.text}>Oops! The page you're looking for doesn't exist.</p>
        <a href="/dashboard" style={styles.link}>Go back to Home</a>
      </div>
    );
  };
  
  const styles = {
    container: {
      textAlign: "center",
      marginTop: "50px",
    },
    heading: {
      fontSize: "2rem",
      color: "#ff4c4c",
    },
    text: {
      fontSize: "1.2rem",
      color: "#333",
    },
    link: {
      fontSize: "1rem",
      color: "#007bff",
      textDecoration: "none",
    },
  };
  
  export default NotFound;
  