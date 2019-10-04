// Code specifically for viewing and managing a task list for each meeting

let isHidden = true;

//TODO: Add a table to the db for meetings, and another for tasks,
// as follows:

// Meeting: name, ID, date, username (of meeting maker)
// Tasks: MeetingName, ID, user, Details, TaskName, username

// Each task has one meeting and one assigned user that it relates to, although names can be shared
// Each meeting has a unique ID, and is findable as a unique combination for the meeting maker's username and the MeetingName

const submitTask = function( e ) { // Submit request for a new task for a user
  // prevent default form action from being carried out
  e.preventDefault()

  const nameInput = document.querySelector( '#meetingname' ),
        userInput = document.querySelector( '#assigneeName' ),
        taskInput = document.querySelector( '#taskName' ),
        json = { meetingname: nameInput.value,  task: taskInput.value, userForTask: userInput.value },
        body = JSON.stringify( json );

  fetch( '/submitTask', { //Note that on the server side, this will also give the assigned user a new message about their task
    method:'POST',
    body: JSON.stringify( json ),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' 
  })
  .then( function( response ) {
    // Update the task list for the user
    console.log( response );
    response.json().then((data) => {
      document.getElementById("tablePrint").innerHTML = '<table></table>';
      if (!isHidden) {
        viewMeeting(e);
      }
    });
  });
  return false;
}

const viewMeeting = function(e) {
  e.preventDefault();
  let taskListArray;

  const nameInput = document.querySelector( '#meetingname' ),
        json = { meetingname: nameInput.value, },
        body = JSON.stringify( json );
  
  fetch( '/viewMeeting', {
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
      taskListArray = data.taskArray;
      let numTasks = taskListArray.length;
    let myTable = '<table class ="pageText"><tr>Meeting: ' + nameInput.value + '</tr><tr><td>Task ID:</td>';
    myTable += "<td>Assigned to:</td>";
    myTable += "<td>Details:</td></tr>";
    for (let i = 0; i < numTasks; i++) { // Make the table with one row per task
      myTable += "<tr><td>" + taskListArray[i].id + "</td>";
      myTable += "<td>" + taskListArray[i].name + "</td>";
      myTable += "<td>" + taskListArray[i].details + "</td></tr>";
    }
    myTable += "</table>";
    document.getElementById("tablePrint").innerHTML = myTable;
    isHidden = false;
    });
  });
  return false;
}

const hide = function( e ) {
  e.preventDefault();
  document.getElementById("tablePrint").innerHTML = '<table></table>';
  isHidden = true;
}

const deleteTask = function( e ) { // Delete a task with a specified id number
  // prevent default form action from being carried out
  e.preventDefault();

  const removeInput = document.querySelector( '#removename' ),
        nameInput = document.querySelector( '#meetingname' ),
        json = { name: removeInput.value, meetingname: nameInput.value};

  fetch( '/remove', {
    method:'DELETE',
    body: JSON.stringify( json ),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  })
  .then( function( response ) {
    // Simply redisplay the table on the response after the deletion occurs
    // if it is not hidden
    console.log( response );
    response.json().then((data) => {
      console.log(data);
      document.getElementById("tablePrint").innerHTML = '<table></table>';
      if (!isHidden) {
        viewMeeting(e);
      }
    });
  });
  return false;
}

window.onload = function() { // Link each button to its respective function
  const inButton = document.querySelector( '#inputButton' );
  const viButton = document.querySelector( '#viewButton' );
  const deButton = document.querySelector( '#removeButton' );
  const hiButton = document.querySelector( '#hideButton' );
  hiButton.onclick = hide;
  viButton.onclick = viewMeeting;
  inButton.onclick = submitTask;
  deButton.onclick = deleteTask;
}
