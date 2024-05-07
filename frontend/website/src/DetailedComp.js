import { useState } from 'react';
import { Button } from 'react-bootstrap';

function DetailedComp({ cardData, toggleDetail, changeContent }) {
  const [value, setValue] = useState(cardData.value);

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
    changeContent(cardData.key, value, cardData.ID);
    toggleDetail(); // Optionally close detail view after saving
  };

  return (
    <div>
      <h1>{cardData.key}</h1>
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

export default DetailedComp;
