// frontend/src/pages/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
`;

const MessageContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const Image = styled.img`
  width: 100px;
  margin-bottom: 15px;
`;

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/signup', { email, password });
      if (response.status === 201) {
        setSignupSuccess(true);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed! Try a different email.');
    }
  };

  const resendEmail = async () => {
    setResendLoading(true);
    try {
      await axios.post('http://localhost:3000/api/auth/resend-verification', { email });
      alert('Verification email resent!');
    } catch (error) {
      console.error('Resend error:', error);
      alert('Failed to resend email.');
    }
    setResendLoading(false);
  };

  return (
    <Container>
      {!signupSuccess ? (
        <form onSubmit={handleSignup}>
          <h2>Sign Up</h2>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit">Sign Up</Button>
        </form>
      ) : (
        <MessageContainer>
          <Image src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Email Inbox" />
          <h3>Check Your Inbox</h3>
          <p>We have sent a verification email to <strong>{email}</strong>.</p>
          <p>Please check your email and click on the link to verify your account.</p>
          <Button onClick={resendEmail} disabled={resendLoading}>
            {resendLoading ? 'Resending...' : 'Resend Email'}
          </Button>
        </MessageContainer>
      )}
    </Container>
  );
};

export default Signup;
