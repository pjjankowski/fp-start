const submitMeeting = function( e ) { // Submit request for a new meeting
  // prevent default form action from being carried out
  e.preventDefault()

  const nameInput = document.querySelector( '#meetingname' ),
        detailsInput = document.querySelector( '#details' ),
        dateInput = document.querySelector('#date'),
        // Can input dates like this, then convert to string
        //<li><span>Choose your date to view here:</span></li>
        //<input type="date" id="date">
        json = { meeting: nameInput.value,  date: dateInput.value, details: detailsInput.value },
        body = JSON.stringify( json );

  fetch( '/submitMeeting', { //This meeting will be made originally empty
    method:'POST',
    body: JSON.stringify( json ),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' 
  })
  .then( function( response ) {
    // Update the task list for the user
    console.log( response );
    response.json().then((data) => {
      //act now that the new meeting has been created
      if (data.meetingAdded) {
        alert("Meeting created");
      } else {
        alert("You already have a meeting of that name");
      }
    });
  });
  return false;
}

const removeMeeting = function( e ) { // Submit request for a new meeting
  // prevent default form action from being carried out
  e.preventDefault()

  const nameInput = document.querySelector( '#meetingname' ),
        dateInput = document.querySelector('#date'),
        json = { meeting: nameInput.value,  date: dateInput.value},
        body = JSON.stringify( json );

  fetch( '/removeMeeting', { //This meeting will be made originally empty
    method:'DELETE',
    body: JSON.stringify( json ),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' 
  })
  .then( function( response ) {
    // Update the task list for the user
    console.log( response );
    response.json().then((data) => {
      //act now that the new meeting has been removed
    });
  });
  return false;
}

window.onload = function() { // Link each button to its respective function
  const inButton = document.querySelector( '#inputButton' );
  const deButton = document.querySelector( '#removeButton' );
  inButton.onclick = submitMeeting;
  deButton.onclick = removeMeeting;
}