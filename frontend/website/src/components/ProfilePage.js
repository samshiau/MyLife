// ProfilePage.js
// Contains components of first tab of the main content page 

import { Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';

// Messages API call, handle message key press, and profile page
const ProfilePage = ({userProfile, messages, setMessages, newMessage, setNewMessage, handleCardClick}) => {

    // Function to send a message to openAI api
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
          alert('Failed to send message. Please try again.');
        }
      };
      
      
      // Function to send a message when the user presses the Enter key
      const handle_Message_KeyPress = (event) => {
        if (event.key === 'Enter') {
          sendMessage();
        }
      };
    
    // Profile page and chat box
    return (
        <Row style={{ height: '100%', width:'100%' }}>

        {/* General user info and summary */}
        <Col xs={5} md={5} lg={5} style={{ height: '100%', backgroundColor: 'grey', borderRadius: '10px' }}>
          <Row style={{ margin: '0px', display: 'flex', flexDirection: 'row', width: '100%', overflowX: 'auto', height: '100%', scrollbarWidth: 'thin', scrollbarColor: '#888 #f1f1f1' }}>
            {userProfile && Object.entries(userProfile).filter(([key, value]) => !['profile_id', 'account_id', 'user_name'].includes(key)).map(([key, value], index) => (
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
       
        {/* Chat box */}
        <Col xs={6} md={6} lg={6} style={{ height: '100%' }}>
          <div style={{ marginTop: '0px', padding: '20px', backgroundColor: '#f8f9fa', height: '100%', boxSizing: 'border-box', color: 'black', display: 'flex', flexDirection: 'column', overflowY: 'auto', borderRadius: '10px' }}>
            <h4>Generative AI Response</h4>
            <div style={{ overflowY: 'auto', flex: '1', marginBottom: '10px' }}>
              {Array.isArray(messages) && messages.map((message, index) => (
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
                  }}>
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
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  marginRight: '10px',
                  width: '80%'
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}>Send</button>
            </div>
          </div>
        </Col>
      </Row>
    );
};

export default ProfilePage;