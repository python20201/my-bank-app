// frontend/src/App.js

import React, { useState } from 'react';
import './App.css'; // We'll add some basic styling

function App() {
  // 'formData' will store what the user types into the form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US', // Defaulted to US as per instructions
    ssn: '',
    email: '',
    dob: '',
  });

  // 'outcome' will store the result we get back from the backend
  const [outcome, setOutcome] = useState(null);
  // 'isLoading' will be true while we wait for the API response
  const [isLoading, setIsLoading] = useState(false);

  // This function updates formData whenever a user types in an input field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // This function is called when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    setIsLoading(true); // Show a loading message
    setOutcome(null);   // Reset previous outcome

    try {
      // Send the form data to our Flask backend API endpoint
      const response = await fetch('http://127.0.0.1:5000/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Something went wrong with the API call!');
      }

      const result = await response.json();
      // Update the 'outcome' state with the result from the backend
      setOutcome(result.outcome);

    } catch (error) {
      console.error('Error submitting application:', error);
      setOutcome('Error'); // Show an error message on the screen
    } finally {
      setIsLoading(false); // Hide the loading message
    }
  };

  // This function displays the correct message based on the outcome
  const renderOutcome = () => {
    if (!outcome) return null; // If there's no outcome, show nothing

    switch (outcome) {
      case 'Approved':
        return <div className="outcome-card success"><h2>✅ Success!</h2><p>Your account has been successfully created.</p></div>;
      case 'Manual Review':
        return <div className="outcome-card review"><h2>Thanks for submitting!</h2><p>We'll be in touch shortly after we review your application.</p></div>;
      case 'Denied':
        return <div className="outcome-card denied"><h2>❌ Sorry!</h2><p>Your application was not successful at this time.</p></div>;
      default:
        return <div className="outcome-card denied"><h2>Error!</h2><p>An unexpected error occurred. Please try again.</p></div>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>My New Bank App 🏦</h1>
        <p>Fill out the form below to create your account.</p>
      </header>
      <main>
        {/* If we have an outcome, show the result. Otherwise, show the form. */}
        {outcome ? (
          renderOutcome()
        ) : (
          <form onSubmit={handleSubmit}>
            <input name="firstName" placeholder="First Name" onChange={handleChange} required />
            {/* For the test personas, you'll type 'Review' or 'Deny' here */}
            <input name="lastName" placeholder="Last Name" onChange={handleChange} required />
            <input name="addressLine1" placeholder="Address Line 1" onChange={handleChange} required />
            <input name="addressLine2" placeholder="Address Line 2 (Optional)" onChange={handleChange} />
            <input name="city" placeholder="City" onChange={handleChange} required />
            <input name="state" placeholder="State (e.g., NY)" onChange={handleChange} required minLength="2" maxLength="2" />
            <input name="zipCode" placeholder="Zip/Postal Code" onChange={handleChange} required />
            <input name="country" value="US" onChange={handleChange} readOnly />
            <input type="tel" name="ssn" placeholder="SSN (9 digits, no dashes)" onChange={handleChange} required pattern="\d{9}" />
            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
            <input type="date" name="dob" placeholder="Date of Birth (YYYY-MM-DD)" onChange={handleChange} required />

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default App;
