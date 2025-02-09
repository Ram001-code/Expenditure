// src/components/Settings.js
import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  background: ${({ theme }) => theme.background};
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #BDC3C7;
  border-radius: 6px;
  font-size: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.8rem;
  background: #2980B9;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background: #3498DB;
  }
`;

const Settings = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        'http://localhost:6969/api/auth/settings',
        { name, email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err.response?.data || err);
      alert('Failed to update profile');
    }
  };

  return (
    <Container>
      <h2>Settings</h2>
      <Input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleUpdate}>Update Profile</Button>
    </Container>
  );
};

export default Settings;
