import React, { useState } from 'react';
import styled from 'styled-components';
import { convertToINR } from '../utils/currencyConversion';
import { motion } from 'framer-motion';

// const amountInINR = convertToINR(expense.amount, expense.currency);

// Container for the entire expense card
const ExpenseCardContainer = styled(motion.div)`
  background: #ECF0F1;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
`;

// Wraps the left part (menu button and description)
const ExpenseContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

// The expense description text
const ExpenseDescription = styled.div`
  font-size: 1.1rem;
  color: #2C3E50;
  margin-left: 0.5rem;
  flex: 1;
`;

// Expense details on the right (amount and date)
const ExpenseDetails = styled.div`
  text-align: right;
  font-size: 0.9rem;
  color: #7F8C8D;
`;

// Three-dot menu button
const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.2rem;
`;

// The container for the dropdown menu
const MenuContainer = styled.div`
  position: absolute;
  top: 40px;
  left: 10px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
  z-index: 10;
`;

// Each item in the dropdown menu
const MenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  &:hover {
    background: #f0f0f0;
  }
`;

// Editable input fields (used in edit mode)
const EditableInput = styled.input`
  padding: 0.3rem;
  font-size: 1rem;
  margin-bottom: 0.2rem;
  width: 100%;
`;

const ExpenseItem = ({ expense, month, index, onUpdate, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(expense.description);
  const [editedAmount, setEditedAmount] = useState(expense.amount);
  const [editedDate, setEditedDate] = useState(expense.date);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleSave = () => {
    const updatedExpense = {
      ...expense,
      description: editedDescription,
      amount: parseFloat(editedAmount),
      date: editedDate,
    };
    onUpdate(month, index, updatedExpense);
    setIsEditing(false);
    setMenuOpen(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDescription(expense.description);
    setEditedAmount(expense.amount);
    setEditedDate(expense.date);
    setMenuOpen(false);
  };

  return (
    <ExpenseCardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ExpenseContent>
        <MenuButton onClick={toggleMenu}>⋮</MenuButton>
        {menuOpen && (
          <MenuContainer>
            <MenuItem
              onClick={() => {
                setIsEditing(true);
                setMenuOpen(false);
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDelete(month, index);
                setMenuOpen(false);
              }}
            >
              Delete
            </MenuItem>
          </MenuContainer>
        )}
        {isEditing ? (
          <EditableInput
            type="text"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
        ) : (
          <ExpenseDescription>{expense.description}</ExpenseDescription>
        )}
      </ExpenseContent>
      {isEditing ? (
        <div style={{ textAlign: 'right' }}>
          <EditableInput
            type="number"
            step="0.01"
            value={editedAmount}
            onChange={(e) => setEditedAmount(e.target.value)}
          />
          <EditableInput
            type="date"
            value={editedDate}
            onChange={(e) => setEditedDate(e.target.value)}
          />
          <div>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <ExpenseDetails>
          <div>Amount: {expense.currency} {expense.amount.toFixed(2)}</div>
          <div>{expense.date}</div>
        </ExpenseDetails>
      )}
    </ExpenseCardContainer>
  );
};

export default ExpenseItem;
