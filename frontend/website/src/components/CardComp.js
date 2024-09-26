// CardComp.js
// Contains the detailed card component and related logic

import React, {useState} from 'react';
import {Button} from 'react-bootstrap';
import axios from 'axios';

// This component contains: Card component, Card display logic, 
// field change logic, save changes handler, 
// API call when change is made, and update the user profile usestate
const CardComp = ({showDetail, setShowDetail, selectedCard, setSelectedCard, userProfile, setUserProfile}) => {

    // Function to toggle the detailed view of a card
    const toggleDetail = () => {
        setShowDetail(!showDetail);
    };

    // card component and related logic
    function DetailedComp() {
        const [value, setValue] = useState(selectedCard.value);
        
        // Handle changes to the textarea, not the save button
        const handleChange = (e) => {

          console.log(e); // The full event object
          console.log(e.target); // The `textarea` DOM element
          console.log(e.target.value); // The current value of the `textarea`
      
          // Update state
          setValue(e.target.value);
        };
      
        // Handle the "Save Changes" button click
        const handleSaveChanges = () => {
          console.log('Saving changes:', value);
          changeContent(value, selectedCard.key);
          console.log('called changeContent');
          toggleDetail(); // Optionally close detail view after saving
        };
      
        // UI component for the detailed view of a card
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
    };

    // API call to update the user profile with the new value
    const changeContent = async (newvalue, cardkey) => {
        console.log('changeContent called   ........');
        console.log(newvalue);
        console.log(cardkey);
    
        if (["age", "selfscore", "selfscorepeople"].includes(cardkey)) {
          newvalue = parseInt(newvalue); 
        }
    
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
            updateProfileKeyVal(selectedCard.key, newvalue);
          }
        })
        .catch((error) => {
          console.error('Error updating user profile:', error);
        });
    
    };


    // Update the user profile use state with the new value when the change to the backend it successful
    const updateProfileKeyVal = (key, value) => {
        console.log('Updating profile key:', key, 'with value:', value);
        setUserProfile((prevProfile) => ({
          ...prevProfile, // Spread the existing properties into the new object
          [key]: value, // Update only the specific key with a new value
        }));
      };
    
    return(
        <div>
          {<DetailedComp/>}
        </div>
    );



};

export default CardComp;
