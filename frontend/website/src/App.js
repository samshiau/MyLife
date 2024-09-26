// App.js
// this file is the root of the react application.
// Contain the top level components and most of the use states of the application.

import React, { useState } from 'react'; 
import 'bootstrap/dist/css/bootstrap.min.css';

//styles
import './Styles/App.css'; 
import './Styles/maincontent.css';

//components
import Accounts from './Components/Accounts';
import MainContent from './Components/MainContent';


// Top level component of the application
// Contains: Use states, handle lougout function, render logic
function App() {
  const [showCreateAccount, setShowCreateAccount] = useState(false);  // determine login from or create account form
  const [loginUsername, setLoginUsername] = useState('');   
  const [loginPassword, setLoginPassword] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('regular');

  const [isLoggedIn, setIsLoggedIn] = useState(false);  // determine if the user is logged in or not to show the main content or the login form
  const [userProfile, setUserProfile] = useState(null); // this is the user profile data
  const [showDetail, setShowDetail] = useState(false);  // determine if the detail view is shown or not
  const [selectedCard, setSelectedCard] = useState(null); // this is the selected card data
  //const [loginPageOrNot, setLoginPageOrNot]=useState(true);
  // const [accountID, setAccountID] = useState(null); // this is the account_id of the user who is logged in

  const [messages, setMessages] = useState([  // ds for holding the messages between the user and the bot
  { sender: 'bot', text: 'Ask AI anything about your profile!' }
]);

  const [newMessage, setNewMessage] = useState('');
  
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
  

  // The JSX that is returned from the App component, which determines what is rendered on the screen
  return (   // if not logged in show the login form, vice versa show the main content
    <div className="App">
      <header className="App-header">
        {isLoggedIn? 
        (<MainContent
          userProfile={userProfile} setUserProfile={setUserProfile}
          showDetail={showDetail} setShowDetail={setShowDetail}
          selectedCard={selectedCard} setSelectedCard={setSelectedCard}
          messages={messages} setMessages={setMessages}
          newMessage={newMessage} setNewMessage={setNewMessage}
          handleLogout={handleLogout}
          />)
        :
        (<Accounts 
          loginUsername={loginUsername} setLoginUsername={setLoginUsername} 
          loginPassword={loginPassword} setLoginPassword={setLoginPassword}
          isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}
          createUsername={createUsername} setCreateUsername={setCreateUsername}
          createPassword={createPassword} setCreatePassword={setCreatePassword}
          confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
          accountType={accountType} setAccountType={setAccountType}
          setUserProfile={setUserProfile} setShowCreateAccount={setShowCreateAccount}
          setSelectedCard={setSelectedCard} setShowDetail={setShowDetail} 
          showCreateAccount={showCreateAccount} messages={messages}
          />)
        }
      </header>
    </div>
  );
}

export default App; // Exporting the App component for use in other parts of the app
