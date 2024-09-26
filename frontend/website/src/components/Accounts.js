// Accounts.js
// Contains all the aoocunts related logic and UI components

import React, {} from 'react';
import axios from 'axios';
import logo from '../Icons/myLifeIcon.png'; // Importing the logo image

// contains login, create account, fetch user profile, creat account from and login form, and 2 buttons to switch between them.
const Accounts = ({loginUsername, setLoginUsername, loginPassword, setLoginPassword, setIsLoggedIn, 
    createUsername, setCreateUsername, createPassword, setCreatePassword, confirmPassword, 
    setConfirmPassword, accountType, setAccountType, setUserProfile, 
    setShowCreateAccount, showCreateAccount, isLoggedIn, messages}) => {


  // login function
  // send credentials to the backend and get the result
  // if the result is successful, get fetch the user profile
  const handleLogin = (event) => {
    event.preventDefault(); // Prevents the default form submission action
    
    const loginData = {
      usernamelogin: loginUsername,
      passwordlogin: loginPassword
    };

    try
    {
      axios.post('http://localhost:8080/login', loginData)
      .then((response) => {
        if (response.status === 200)  // needs changes depends on the backend
        {
          alert('Login successful!');
          // Reset form fields after successful login
          setLoginUsername('');
          setLoginPassword('');
          // Redirect to main content page
          setIsLoggedIn(true);

          //setAccountID(response.data.account_id);
          console.log('account_id is ...:', response.data.account_id);
          fetchUserProfile(response.data.account_id);

        }
      });
    }
    catch(error)
    {
      alert(`Error logging in: ${error.response ? error.response.data.message : error.message}`);
    }
    
    
  };

  // create accoun with the given credentials
  const handleCreateAccount = async (event) => {
    console.log('i am in create account!');
    event.preventDefault(); // Prevents the default form submission action

    if (createPassword !== confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }

    const accountData = {
      username: createUsername,
      password: createPassword,
      account_type: accountType
    };

    try 
    {
      // Send the account data to the backend using Axios
      const response = await axios.post('http://localhost:8080/create_account', accountData);
  
      // If the backend responds with a success status
      if (response.status === 201)
      {
        alert('Account created successfully!');
  
        // Optional: Reset form fields after successful account creation
        setCreateUsername('');
        setCreatePassword('');
        setConfirmPassword('');
        setAccountType('regular');
  
        // Optional: Redirect to login page or another page
        // useHistory to navigate: let history = useHistory(); then use history.push('/login');
      }
    }
    catch (error) 
    {
      // If the backend responds with an error status
      alert(`Error creating account: ${error.response ? error.response.data.message : error.message}`);
    }

    

  };

  // fetch the user profile with the given account id
  const fetchUserProfile = async (accountID) => {
    try {
      console.log('accountID before sending request was:', accountID);
      const url = `http://localhost:8080/obtain_user_profile?acc_id=${accountID}`;
      const profileResponse = await axios.get(url);
  
      if (profileResponse.status === 200) {
        console.log('User profile:', profileResponse.data);
        console.log("messages right now is:",messages)
        setUserProfile(profileResponse.data);
      } else {
        console.log('Unexpected status:', profileResponse.status);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const loginForm = (
    <>
    <img src={logo} className="App-logo" alt="logo" /> 
    <h1>Welcome to myLife</h1>
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
    </>
  );
  
  const createAccountButton=(<button className="createANDlogin" onClick={() => {setShowCreateAccount(true); }}>Create Account</button>);
  const goBacktoLoginButton=(<button className="createANDlogin" onClick={() => {setShowCreateAccount(false); }}>Back to Login</button>);

  const createAccountForm = (
    <>
    <h1>Welcome to myLife</h1>
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
    </>
  );

   return(
    <div>
        { showCreateAccount? (createAccountForm): (loginForm) }
        {!isLoggedIn && (showCreateAccount ? goBacktoLoginButton : createAccountButton)} 
    </div>
   );

};

export default Accounts;