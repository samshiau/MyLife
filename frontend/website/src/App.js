// App.js
import React, { useState } from 'react'; // Importing React and the useState hook from the React library
import logo from './myLifeIcon.png'; // Importing the logo image
import './App.css'; // Importing the stylesheet for the App component
import './maincontent.css';
import axios from 'axios';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
//import DetailedComp from './DetailedComp'; 
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
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome to the chat!' }
  ]);
  const [newMessage, setNewMessage] = useState('');

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

  const sendMessage = async () => {
    // Collect info from struct and the message in the input field
    const message_package = {
      message: newMessage,
      query_account_id: userProfile.account_id,
    };

    console.log('Message package:', message_package);
  
    try {
      // Send the message to the backend
      const response = await axios.post('http://localhost:8080/openai_api_request', message_package);
  
      if (response.status === 200) {
        // Update the messages state with the response from the backend
        const botMessage = response.data; // Assuming the response contains the bot's message
  
        setMessages(prevMessages => [
          ...prevMessages,
          { sender: 'user', text: newMessage }, // Add the user's message
          { sender: 'bot', text: botMessage }  // Add the bot's response
        ]);
  
        // Clear the input field
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally, you can display an error message to the user
      alert('Failed to send message. Please try again.');
    }
  };
  

  const handleCardClick = (key, value, ID) => {
    console.log('Card clicked:', key, value, ID);
    setSelectedCard({ key, value, ID });
    setShowDetail(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // Set logged-in status to false
    setUserProfile(null); // Clear user profile data
    setSelectedCard(null); // Clear any selected card data
    setLoginUsername(''); // Clear login username field
    setLoginPassword(''); // Clear login password field
    setShowDetail(false); // Reset detailed view
    setShowCreateAccount(false); // Reset account creation form visibility
    console.log('User logged out successfully.');
  };

  
  const updateProfileKeyVal = (key, value) => {
    console.log('Updating profile key:', key, 'with value:', value);
    setUserProfile((prevProfile) => ({
      ...prevProfile, // Spread the existing properties into the new object
      [key]: value, // Update only the specific key with a new value
    }));
  };

  const handle_Message_KeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const changeContent = async (newvalue, cardkey) => {
    console.log('changeContent called   ........');
    console.log(newvalue);
    console.log(cardkey);

    if (["age", "selfscore", "selfscorepeople"].includes(cardkey)) {
      newvalue = parseInt(newvalue); 
    }


    // i want to tell the server that i want to change a col in the userprofile by the account id and and the field "carddata.key" inside the column 
    const updateContent = {
      account_id: selectedCard.ID,
      field: selectedCard.key,
      value: newvalue,
    }

    console.log('the actual value is.....:',newvalue);
    console.log('before api call');
    console.log('updateContent will be:', updateContent);
    axios.patch(`http://localhost:8080/change_db_data`, updateContent, {headers: { 'Content-Type': 'application/json' },})
    .then((response) => {
      if (response.status === 200) {
        console.log('User profile updated successfully:', response.data);
        // Update the local userProfile state with the new value
        // ***** remember to update the userProfile state with the new value
        updateProfileKeyVal(selectedCard.key, newvalue);
      }
    })
    .catch((error) => {
      console.error('Error updating user profile:', error);
    });

  };

  const toggleDetail = () => {
    setShowDetail(!showDetail);
};



  function DetailedComp() {
    const [value, setValue] = useState(selectedCard.value);
    
    // Handle changes to the textarea
    const handleChange = (e) => {
      // Log the event object
      console.log(e); // The full event object
      console.log(e.target); // The `textarea` DOM element
      console.log(e.target.value); // The current value of the `textarea`
  
      // Update state
      setValue(e.target.value);
    };
  
    const handleSaveChanges = () => {
      console.log('Saving changes:', value);
      changeContent(value, selectedCard.key);
      console.log('called changeContent');
      toggleDetail(); // Optionally close detail view after saving
    };
  
    return (
      <div>
        <h1>{selectedCard.key}</h1>
        <textarea
          value={value}
          onChange={handleChange} // Update state when user types
          rows={4}
          style={{ width: '100%' }}
        />
        <div>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
          <Button onClick={toggleDetail}>Go Back</Button>
        </div>
      </div>
    );
  }


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
  const createAccountButton=(<button className="createANDlogin" onClick={() => {setShowCreateAccount(true); setLoginPageOrNot(false); }}>Create Account</button>);
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
    <Container style={{ maxWidth: '70%', margin: '0 auto', }}>
      <Row>
      <Row>
            <Col xs={3} md={2} lg={1}>
              <img src={logo} className="App-logo2" alt="logo" />
            </Col>
            <Col xs={9} md={6} lg={5}>
              <h2>User Profile</h2>
            </Col>
            <Col>
              <Button onClick={() => handleLogout()} >Logout</Button>
            </Col>
          </Row>  
        <Col xs={12} md={8} lg={6} style={{ height: '100%' }}>
          
          
          <Row style={{ display: 'flex', flexDirection: 'row', width: '100%', overflowX: 'auto', height: '100%', overflowY: 'auto' }}>
              {Object.entries(userProfile)
              .filter(([key, value]) => !['profile_id', 'account_id', 'user_name'].includes(key))
              .map(([key, value], index) => (
                <Col key={index} xs={12} style={{ minWidth: '300px' }}>
                  <Card className="custom-card" onClick={() => handleCardClick(key, value, userProfile.account_id)}>
                    <Card.Body>
                      <Card.Title>{key}</Card.Title>
                          <Card.Text>{value || 'Not specified'}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                ))}
          </Row>
        </Col>
        <Col xs={12} md={4} lg={6} style={{ height: '100%' }}>  
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', height: '100%', boxSizing: 'border-box', color: 'black', display: 'flex', flexDirection: 'column',overflowY: 'auto' }}>
          <h3>Generative AI Response</h3>
          <div style={{ overflowY: 'auto', flex: '1', marginBottom: '10px' }}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                padding: '10px',
                margin: '10px 0',
                backgroundColor: message.sender === 'user' ? '#007bff' : '#f1f0f0',
                color: message.sender === 'user' ? 'white' : 'black',
                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                borderRadius: '8px',
                maxWidth: '60%',
                
              }}
            >
          {message.text}
          </div>
          ))}
</div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handle_Message_KeyPress}
          placeholder="Type your message..."
          style={{
            flex: '1',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginRight: '10px'
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
        </Col>
      </Row>
    </Container>
) : (
    <p>Unable to load your profile.</p>
);




  // The JSX that is returned from the App component, which determines what is rendered on the screen
  return (
    <div className="App">
      <header className="App-header">
        {isLoggedIn ? (showDetail && selectedCard ? <DetailedComp cardData={selectedCard} toggleDetail={toggleDetail} /> : mainContent) : (showCreateAccount ? createAccountForm : loginForm)}
        {/* Button to toggle create account form is only shown if not logged in */}
        {!isLoggedIn && (showCreateAccount ? goBacktoLoginButton : createAccountButton)}    
      </header>
    </div>
  );
}

export default App; // Exporting the App component for use in other parts of the app
