// MainContent.js
// Contains login for 4 tabs: Profile, Timeline, Network, Profile sharing

import React, {}  from 'react';
import { Container, Row, Col, Button, Tab, Nav } from 'react-bootstrap';
import TimelineUI from './TimelineUI';
import ProfilePage from './ProfilePage';
import CardComp from './CardComp';

// Main content component
// 4 tabs, and shared states and functions
const MainContent = ({userProfile, setUserProfile, showDetail, setShowDetail, selectedCard, 
                    setSelectedCard, messages, setMessages, newMessage, setNewMessage, handleLogout}) => {

    // putting the card click handler here for profile page and card comp.
    const handleCardClick = (key, value, ID) => {
        console.log('Card clicked:', key, value, ID);
        setSelectedCard({ key, value, ID });
        setShowDetail(true);
    };

    // 4 tabs: Profile, Timeline, Network, Profile sharing
    const content=(
        <Container style={{ maxWidth: '90%', margin: '0 auto', }}>
        <Tab.Container defaultActiveKey="first">
        {/* Outermost row */}
        <Row style={{ width:'100%', height:'100%' }}>


            {/* Tabs column */}
            <Col xs={1} md={1} lg={1}>
            <Row>
                <Nav variant="pills" className="flex-column">

                <Nav.Item>
                    <Nav.Link eventKey="first" style={{ fontSize: '18px' }}>Profile</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="second" style={{ fontSize: '18px' }}>Timeline</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="third" style={{ fontSize: '18px' }}>Network</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="fourth" style={{ fontSize: '18px' }}>Profile sharing</Nav.Link>
                </Nav.Item>

                </Nav>
            </Row>
            <Row>
                <Col> 
                <Button onClick={() => handleLogout()} style={{ width: '65px', fontSize: '14px' }}>Logout</Button> 
                </Col>
            </Row>
                
            </Col>


            {/* Page column  */}
            <Col xs={10} md={10} lg={10} style={{ height: '100%'}}>
            <Tab.Content style={{ height: '100%', width:'100%' }}>
                {/* All the tabs */}

                {/* Prfile tab */}
                <Tab.Pane eventKey="first" id="profile-tab">
                {userProfile ? (<ProfilePage userProfile={userProfile}
                                messages={messages} setMessages={setMessages} 
                                newMessage={newMessage} setNewMessage={setNewMessage}
                                handleCardClick={handleCardClick}/>) 
                            : (<p>Unable to load your profile.</p>)}
                </Tab.Pane>

                {/*Timeline tab*/}
                <Tab.Pane eventKey="second" style={{ height: '100%', width: '100%' }}>
                <Row style={{ height: '100%', width:'100%' }}>
                <Col Col xs={12} md={12} lg={12}>
                    <TimelineUI />
                </Col>
                </Row> 
                </Tab.Pane>

                {/*Network tab*/}
                <Tab.Pane eventKey="third">
                <Row></Row>
                </Tab.Pane>

                {/*Profile sharing management tab*/}
                <Tab.Pane eventKey="fourth">
                <Row></Row>
                </Tab.Pane>

            </Tab.Content>
            </Col>


        </Row>
        </Tab.Container>
        </Container>);

 return (
    <div>
        {showDetail && selectedCard ? (<CardComp showDetail={showDetail} setShowDetail={setShowDetail} 
                                    selectedCard={selectedCard} setSelectedCard={setSelectedCard}
                                    userProfile={userProfile} setUserProfile={setUserProfile}
                                    messages={messages || []} setMessages={setMessages} newMessage={newMessage} setNewMessage={setNewMessage}
                                    handleCardClick={handleCardClick}
                                    />):(content)}
    </div>

 );
};

export default MainContent;