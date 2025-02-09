// src/components/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ChangeProfilePhotoModal from './ChangeProfilePhotoModal';

const Nav = styled(motion.nav)`
  background: linear-gradient(90deg, #2980B9, #3498DB);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const NavTitle = styled.h1`
  color: #ECF0F1;
  font-size: 1.8rem;
  font-weight: 700;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  a {
    color: #ECF0F1;
    margin-left: 1.5rem;
    font-weight: 600;
    transition: color 0.3s ease;
    &:hover {
      color: #D6EAF8;
    }
  }
`;

const ProfileContainer = styled.div`
  position: relative;
  margin-left: 1.5rem;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid white;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
  z-index: 10;
  width: 180px;
`;

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  color: #2C3E50;
  &:hover {
    background: #f0f0f0;
  }
`;

const Navbar = ({ toggleTheme }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [profilePhoto, setProfilePhoto] = useState(
    'https://static.vecteezy.com/system/resources/thumbnails/035/857/779/small/people-face-avatar-icon-cartoon-character-png.png'
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:3000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.profilePic) {
          const imageUrl = `http://localhost:3000${response.data.profilePic}`;
          setProfilePhoto(imageUrl);
          localStorage.setItem('profilePhotoUrl', imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch profile photo:', error);
      }
    };

    fetchProfilePhoto();
  }, [token, photoModalOpen]); // ✅ Re-fetch profile after upload

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profilePhotoUrl');
    navigate('/');
    window.location.reload();
  };

  return (
    <Nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NavTitle>Expenditure Planner</NavTitle>
      <NavLinks>
        <Link to="/">Home</Link>
        {token ? (
          <>
            <Link to="/planner">Planner</Link>
            <ProfileContainer ref={dropdownRef}>
              <ProfileImage
                src={profilePhoto}
                alt="Profile"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <DropdownMenu>
                  <DropdownItem onClick={() => { setDropdownOpen(false); navigate('/settings'); }}>
                    Edit Account Info
                  </DropdownItem>
                  {/* <DropdownItem onClick={() => { setDropdownOpen(false); setPhotoModalOpen(true); }}>
                    Change Profile Photo
                  </DropdownItem> */}
                  <DropdownItem onClick={() => { setDropdownOpen(false); toggleTheme(); }}>
                    Change Theme
                  </DropdownItem>
                  <DropdownItem onClick={() => { setDropdownOpen(false); handleLogout(); }}>
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              )}
            </ProfileContainer>
            {photoModalOpen && (
              <ChangeProfilePhotoModal onClose={() => setPhotoModalOpen(false)} />
            )}
          </>
        ) : (
          <>
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </NavLinks>
    </Nav>
  );
};

export default Navbar;
