// src/components/ChangeProfilePhotoModal.js
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
`;

const Input = styled.input`
  width: 100%;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #2980B9;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 1rem;
`;

const ChangeProfilePhotoModal = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Only JPG, PNG, and GIF files are allowed.');
        return;
      }
      if (selectedFile.size > 2 * 1024 * 1024) { // 2 MB limit
        setError('File size must be less than 2 MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePhoto', file);
  
      const response = await axios.post('http://localhost:3000/api/auth/uploadProfilePhoto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        }
      });
      // Save the new photo URL (if needed) and update the UI
      localStorage.setItem('profilePhotoUrl', response.data.photoUrl);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Upload failed:', err.response?.data || err);
      setError('Upload failed. Please try again.');
    }
  };


  return (
    <ModalOverlay>
      <ModalContent>
        <h3>Change Profile Photo</h3>
        <Input type="file" onChange={handleFileChange} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Button onClick={handleUpload}>Upload</Button>
        <Button onClick={onClose}>Cancel</Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChangeProfilePhotoModal;
