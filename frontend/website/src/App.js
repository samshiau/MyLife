// App.js
import React, { useState } from 'react'; // Importing React and the useState hook from the React library
import logo from './myLifeIcon.png'; // Importing the logo image
import './App.css'; // Importing the stylesheet for the App component
import './maincontent.css';
import axios from 'axios';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
//import { useNavigate  } from 'react-router-dom';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
 // const [accountID, setAccountID] = useState(null); // this is the account_id of the user who is logged in
  const [userProfile, setUserProfile] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);


  // login function
  const handleLogin = (event) => {
    event.preventDefault(); // Prevents the default form submission action
    // Placeholder for the login logic
    console.log('i am in login!');
    
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
          // Redirect to another page
          setIsLoggedIn(true);
          //setAccountID(response.data.account_id);
          console.log('account_id is ...:', response.data.account_id);
          fetchUserProfile(response.data.account_id);
          // useHistory to navigate: let history = useHistory(); then use history.push('/dashboard');

        }
      });
    }
    catch(error)
    {
      alert(`Error logging in: ${error.response ? error.response.data.message : error.message}`);
    }
    
    
  };

  // create account 
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


  const fetchUserProfile = async (accountID) => {
    try {
      // Properly pass the 'acc_id' as a query parameter in the URL
      console.log('accountID before sending request was:', accountID);
      const url = `http://localhost:8080/obtain_user_profile?acc_id=${accountID}`;
      const profileResponse = await axios.get(url);
  
      if (profileResponse.status === 200) {
        console.log('User profile:', profileResponse.data);
        setUserProfile(profileResponse.data);
      } else {
        console.log('Unexpected status:', profileResponse.status);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const handleCardClick = (key, value) => {
    setSelectedCard({ key, value });
    setShowDetail(true);
  };
  

  const toggleDetail = () => {
    setShowDetail(!showDetail);
};

function DetailedComp({ cardData, toggleDetail }) {
  return (
    <div>
      <h1>Detail View: {cardData.key}</h1>
      <p>Here is more detailed information: {cardData.value}</p>
      <Button onClick={toggleDetail}>Go Back</Button>
    </div>
  );
}


 // const handleLogout = (event) => {
  //  event.preventDefault(); // Prevents the default form submission action
    // Placeholder for the logout logic

 // };

  // JSX for the login form, which is conditionally rendered based on showCreateAccount
  const loginForm = (
    <>
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
  const createAccountButton=(<button className="createANDlogin" onClick={() => {setShowCreateAccount(true); setLoginPageOrNot(false); }}> Create Account</button>);
  const goBacktoLoginButton=(<button className="createANDlogin" onClick={() => {setShowCreateAccount(false); setLoginPageOrNot(true); }}>Back to Login</button>);

  // JSX for the create account form, which includes additional fields and a dropdown
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

  const mainContent = userProfile ? (
    <Container>
      <h2>User Profile</h2>
      <Row>
        {Object.entries(userProfile).map(([key, value], index) => (
          <Col key={index} sm={12} md={6} lg={4}>
            <Card className="mb-3" onClick={() => handleCardClick(key, value)}>
              <Card.Body>
                <Card.Title>{key}</Card.Title>
                <Card.Text>{value || 'Not specified'}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  ) : (
    <p>Loading profile...</p>
  );

  // The JSX that is returned from the App component, which determines what is rendered on the screen
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />  
        {isLoggedIn ? (showDetail && selectedCard ? <DetailedComp cardData={selectedCard} toggleDetail={toggleDetail} /> : mainContent) : (showCreateAccount ? createAccountForm : loginForm)}
        {/* Button to toggle create account form is only shown if not logged in */}
        {!isLoggedIn && (showCreateAccount ? goBacktoLoginButton : createAccountButton)}    
      </header>
    </div>
  );
}

export default App; // Exporting the App component for use in other parts of the app
