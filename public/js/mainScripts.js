// Here is where the js will go for allowing users to add, remove, and display meetings by date

let isHidden = true;
let isHiddenTasks = true;

const hide = function( e ) {
  e.preventDefault();
  document.getElementById("tablePrintM").innerHTML = '<table></table>';
  isHiddenTasks = true;
}

// Get all meetings from the database for this date and this user
const view = function(e) {
  e.preventDefault();
  console.log("here");

  const dateInput = document.querySelector( '#enteredDate' );
  console.log(dateInput.value);
  if (dateInput.value !== "") {
    let meetingsArray;
        const json = { date: dateInput.value, },
        body = JSON.stringify( json );
  
  fetch( '/viewMyMeetings', {
    method:'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body
  })
  .then( function( response ) {
    
    // Fetch all tasks for this meeting in the database to add to a table
    console.log( response );
    response.json().then((data) => {
      console.log(data);
      meetingsArray = data.meetingsArray;
      let numTasks = meetingsArray.length;
    let myTable = '<table class ="pageText"><td>Meeting Name:</td>';
    myTable += "<td>Meeting Date:</td>";
    myTable += "<td>Meeting Creator:</td>";
    myTable += "<td>Meeting Details:</td></tr>";
    for (let i = 0; i < numTasks; i++) { // Make the table with one row per task
      myTable += "<tr><td>" + meetingsArray[i].name + "</td>";
      myTable += "<td>" + meetingsArray[i].date + "</td>";
      myTable += "<td>" + meetingsArray[i].username + "</td>";
      myTable += "<td>" + meetingsArray[i].details + "</td></tr>";
    }
    myTable += "</table>";
    document.getElementById("tablePrint").innerHTML = myTable;
    isHidden = false;
    });
  });
  return false;
  } else {
    alert("Enter a full date to see meetings on that date that you have made");
  }
}

const viewTasks = function(e) {
  e.preventDefault();
  let tasksArray;

  const nameInput = document.querySelector( '#meetingname' ),
        json = { meeting: nameInput.value, },
        body = JSON.stringify( json );
  
  fetch( '/viewTasks', {
    method:'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body
  })
  .then( function( response ) {
    
    // Fetch all tasks for this meeting in the database to add to a table
    console.log( response );
    response.json().then((data) => {
      console.log(data);
      if (data.tasksArray) {
        tasksArray = data.tasksArray;
        let numTasks = tasksArray.length;
        let myTable = '<table class ="pageText"><tr>Meeting: ' + nameInput.value + '</tr><tr><td>Task Name:</td>';
        myTable += "<td>Assigned to:</td>";
        myTable += "<td>Details:</td></tr>";
        for (let i = 0; i < numTasks; i++) { // Make the table with one row per task
          myTable += "<tr><td>" + tasksArray[i].taskName + "</td>";
          myTable += "<td>" + tasksArray[i].assigneeName + "</td>";
          myTable += "<td>" + tasksArray[i].details + "</td></tr>";
        }
        myTable += "</table>";
        document.getElementById("tablePrint").innerHTML = myTable;
        isHidden = false;
      } else {
        alert("You have not made a meeting with the name that you entered.")
      }
    });
  });
  return false;
}

window.onload = function() { // Link each button to its respective function
  const viButton = document.querySelector( '#viewButton' ),
  viTaButton = document.querySelector(' #viewButtonM '),
  hiButton = document.querySelector( '#hideButtonM' );
  viButton.onclick = view;
  hiButton.onclick = hide;
  viTaButton.onclick = viewTasks;
}