// src/components/MonthlyPlanner.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import ExpenseItem from './ExpenseItem';
import AddExpense from './AddExpense';
import { convertToINR } from '../utils/currencyConversion';
// const amountInINR = convertToINR(expense.amount, expense.currency);

const PlannerWrapper = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #FFFFFF;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const MonthSection = styled.div`
  margin-bottom: 2rem;
`;

const MonthHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3498DB;
  color: #2980B9;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ExpenseList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TotalText = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #2C3E50;
`;

const MonthlyPlanner = () => {
  const [plannerData, setPlannerData] = useState({});

  // Helper: Remove empty months from the planner data
  const cleanupEmptyMonths = (data) => {
    const cleaned = { ...data };
    Object.keys(cleaned).forEach((month) => {
      if (cleaned[month].length === 0) {
        delete cleaned[month];
      }
    });
    return cleaned;
  };

  const fetchPlannerData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/auth/planner', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlannerData(response.data.expenditurePlanner || {});
    } catch (error) {
      console.error('Error fetching planner data:', error);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

  // Delete expense from planner data
  const handleDeleteExpense = async (month, index) => {
    const token = localStorage.getItem('token');
    // Copy current planner data
    const updatedData = { ...plannerData };
    // Remove the expense at the given index
    updatedData[month].splice(index, 1);
    // Remove month if empty
    const cleanedData = cleanupEmptyMonths(updatedData);
    try {
      const updateResponse = await axios.put(
        'http://localhost:3000/api/auth/planner',
        { expenditurePlanner: cleanedData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Planner updated:', updateResponse.data);
      setPlannerData(cleanedData);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Helper: Convert "YYYY-MM" to "Month Name - YYYY"
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    const monthName = date.toLocaleString('default', { month: 'long' });
    return `${monthName} - ${year}`;
  };

  // Calculate totals per currency for a given month
  const calculateTotals = (expenses) => {
    const totals = {};
    expenses.forEach(expense => {
      const cur = expense.currency;
      totals[cur] = (totals[cur] || 0) + parseFloat(expense.amount);
    });
    return totals;
  };
  

  return (
    <div>
      <PlannerWrapper>
        <h1 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '1.5rem' }}>
          Your Monthly Expenditures
        </h1>
        {plannerData && Object.keys(plannerData).length > 0 ? (
          Object.entries(plannerData).map(([month, expenses]) => {
            const totals = calculateTotals(expenses);
            return (
              <MonthSection key={month}>
                <MonthHeading>
                  <div>{formatMonth(month)}</div>
                  <TotalText>
                    {Object.entries(totals)
                      .map(([cur, total]) => `${cur} ${total.toFixed(2)}`)
                      .join(' | ')}
                  </TotalText>
                </MonthHeading>
                <ExpenseList>
                  {expenses.map((expense, index) => (
                    <ExpenseItem
                      key={index}
                      expense={expense}
                      month={month}
                      index={index}
                      onDelete={handleDeleteExpense}
                      // onUpdate callback omitted here for brevity
                    />
                  ))}
                </ExpenseList>
              </MonthSection>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', color: '#7F8C8D' }}>
            No data available. Start by adding your expenditures!
          </p>
        )}
      </PlannerWrapper>
      <AddExpense refreshPlanner={fetchPlannerData} />
    </div>
  );
};

export default MonthlyPlanner;
