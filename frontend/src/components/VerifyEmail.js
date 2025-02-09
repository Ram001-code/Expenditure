// frontend/src/pages/VerifyEmail.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
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

const Image = styled.img`
  width: 100px;
  margin-bottom: 15px;
`;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(`http://localhost:6969/api/auth/verify?token=${token}`);
        setStatus('Email Verified ✅');
        setTimeout(() => {
          navigate('/login');
        }, 6969);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('Invalid or expired token ❌');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('Invalid verification link ❌');
    }
  }, [navigate, token]);

  return (
    <Container>
      <Image src="https://cdn-icons-png.flaticon.com/512/845/845646.png" alt="Verified" />
      <h3>{status}</h3>
      <p>Redirecting to the Sign In page in 3 seconds...</p>
    </Container>
  );
};

export default VerifyEmail;