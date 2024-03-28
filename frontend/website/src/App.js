// App.js
import React, { useState } from 'react'; // Importing React and the useState hook from the React library
import logo from './myLifeIcon.png'; // Importing the logo image
import './App.css'; // Importing the stylesheet for the App component

// The App component definition. This is a functional component.
function App() {
  // useState hook to manage the visibility of the create account form
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  // useState hooks for managing the state of login form inputs
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // useState hooks for managing the state of create account form inputs
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('regular');
  const [loginPageOrNot, setLoginPageOrNot]=useState(true);

  // Event handler function for when the login form is submitted
  const handleLogin = (event) => {
    event.preventDefault(); // Prevents the default form submission action
    // Placeholder for the login logic
  };

  // Event handler function for when the create account form is submitted
  const handleCreateAccount = (event) => {
    event.preventDefault(); // Prevents the default form submission action
    // Placeholder for the create account logic
  };

  // JSX for the login form, which is conditionally rendered based on showCreateAccount
  const loginForm = (
    <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className='input-label'>Username:</label>
            <input
              id="username"
              type="text"
              className="input-field"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="login-button">Login</button>
          </div>
        </form>

  );
  const createAccountButton=(<button className="createANDlogin" onClick={() => {setShowCreateAccount(true); setLoginPageOrNot(false); }}> Create Account</button>);
  const goBacktoLoginButton=(<button className="createANDlogin" onClick={() => {setShowCreateAccount(false); setLoginPageOrNot(true); }}>Back to Login</button>);

  // JSX for the create account form, which includes additional fields and a dropdown
  const createAccountForm = (
    <form onSubmit={handleCreateAccount} className="login-form">
    <div className="form-group">
      <label htmlFor="create-username" className='input-label'>Username:</label>
      <input
        id="create-username"
        type="text"
        className="input-field"
        value={createUsername}
        onChange={(e) => setCreateUsername(e.target.value)}
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="create-password">Password:</label>
      <input
        id="create-password"
        type="password"
        className="input-field"
        value={createPassword}
        onChange={(e) => setCreatePassword(e.target.value)}
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="confirm-password">Confirm Password:</label>
      <input
        id="confirm-password"
        type="password"
        className="input-field"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="account-type">Account type: </label>
      <select
        id="account-type"
        className="selectAccType"
        value={accountType}
        onChange={(e) => setAccountType(e.target.value)}
        required
      >
        <option value="regular">Regular Account</option>
        <option value="therapist">Therapist/Doctor</option>
      </select>
    </div>
    <div className="form-group">
      <button type="submit" className="registerButton">Register</button>
    </div>
  </form>
  );

  // The JSX that is returned from the App component, which determines what is rendered on the screen
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Welcome to MyLife</h1>
        {showCreateAccount ? createAccountForm : loginForm} 
        {loginPageOrNot ? createAccountButton : goBacktoLoginButton}
      </header>
    </div>
  );
}

export default App; // Exporting the App component for use in other parts of the app
