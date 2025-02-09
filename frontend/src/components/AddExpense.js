// src/components/AddExpense.js
import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FormContainer = styled(motion.div)`
  max-width: 500px;
  margin: 2rem auto;
  background: #FFFFFF;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  text-align: center;
  color: #2980B9;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #BDC3C7;
  border-radius: 6px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #3498DB;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
  }
`;

// Improved custom-styled select with a custom arrow icon
const Select = styled.select`
  appearance: none;
  background: #fff url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="5" viewBox="0 0 10 5"><path fill="%233498DB" d="M0 0l5 5 5-5z"/></svg>') no-repeat right 10px center;
  background-size: 10px 5px;
  border: 1px solid #BDC3C7;
  border-radius: 6px;
  font-size: 1rem;
  padding: 0.8rem 1.5rem 0.8rem 0.8rem;
  margin-bottom: 1rem;
  &:focus {
    outline: none;
    border-color: #3498DB;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.8rem;
  background: #2980B9;
  color: #ECF0F1;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background: #3498DB;
  }
`;

const ErrorText = styled.p`
  color: #E74C3C;
  text-align: center;
`;

const AddExpense = ({ refreshPlanner }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!description || !amount || !date) {
      setError('Please fill in all required fields.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication failed. Please log in again.');
        return;
      }
  
      console.log('Sending request to planner API with token:', token);
  
      const getResponse = await axios.get('http://localhost:6969/api/auth/planner', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      console.log('Planner Data:', getResponse.data);
  
      let plannerData = getResponse.data.expenditurePlanner || {};
  
      const selectedDate = new Date(date);
      const year = selectedDate.getFullYear();
      let month = selectedDate.getMonth() + 1;
      month = month < 10 ? `0${month}` : month;
      const monthKey = `${year}-${month}`;
  
      if (!plannerData[monthKey]) {
        plannerData[monthKey] = [];
      }
  
      const newExpense = {
        description,
        amount: parseFloat(amount),
        date,
        currency,
      };
  
      plannerData[monthKey].push(newExpense);
  
      console.log('Updating planner data with:', plannerData);
  
      const updateResponse = await axios.put(
        'http://localhost:6969/api/auth/planner',
        { expenditurePlanner: plannerData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('Update Response:', updateResponse.data);
  
      setDescription('');
      setAmount('');
      setDate('');
      setCurrency('USD');
      if (refreshPlanner) {
        refreshPlanner();
      }
    } catch (err) {
      console.error('Error adding expense:', err.response?.data || err);
      setError('Failed to add expense.');
    }
  };
  

  return (
    <FormContainer
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <FormTitle>Add Expense</FormTitle>
      <form onSubmit={handleAddExpense}>
        <Input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
        >
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="POUNDS">POUNDS</option>
        </Select>
        <Button type="submit">Add Expense</Button>
      </form>
      {error && <ErrorText>{error}</ErrorText>}
    </FormContainer>
  );
};

export default AddExpense;
