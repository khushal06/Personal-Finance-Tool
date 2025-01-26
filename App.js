import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({ date: "", category: "", amount: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios.get("http://localhost:3000/transactions")
      .then((response) => setTransactions(response.data))
      .catch((error) => setError("Failed to fetch transactions."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:3000/transactions", formData)
      .then((response) => {
        setTransactions([...transactions, response.data]);
        setFormData({ date: "", category: "", amount: "" });
        setError(null);
      })
      .catch(() => setError("Failed to add transaction."));
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:3000/transactions/${id}`)
      .then(() => setTransactions(transactions.filter((t) => t.id !== id)))
      .catch(() => setError("Failed to delete transaction."));
  };

  return (
    <div className="App">
      <h1>Personal Finance Tool</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="transaction-form">
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          required
        />
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
        />
        <button type="submit">Add Transaction</button>
      </form>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td>{transaction.category}</td>
                <td>{transaction.amount}</td>
                <td>
                  <button onClick={() => handleDelete(transaction.id)} className="delete-button">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
