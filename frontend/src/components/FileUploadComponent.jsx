import React, { useState } from 'react';
import PropTypes from 'prop-types';

const FileUploadComponent = ({ label, onChange, accept, styles }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    onChange(event.target.files[0]);
  };

  return (
    <div>
      <label>{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={styles}
      />
      {selectedFile && <p>Selected file: {selectedFile.name}</p>}
    </div>
  );
};

FileUploadComponent.propTypes = {
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  accept: PropTypes.string,
  style: PropTypes.string
};

FileUploadComponent.defaultProps = {
  accept: '*/*',
};

export default FileUploadComponent;
