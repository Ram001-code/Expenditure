import React from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  padding: 2rem;
  text-align: center;
`;

const WelcomeMessage = styled.h2`
  font-size: 2rem;
  color: #333;
`;

const Home = () => (
  <HomeContainer>
    <WelcomeMessage>Welcome to Your Expenditure Planner!</WelcomeMessage>
    <p>Sign in or sign up to start tracking your monthly expenditures.</p>
  </HomeContainer>
);

export default Home;
