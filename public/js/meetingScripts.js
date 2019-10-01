// Code specifically for viewing and managing a task list for each meeting

let isHidden = true;

//TODO: Add a table to the db for meetings, and another for tasks,
// as follows:

// Meeting: MeetingName, MeetingID, Date, Creator
// Tasks: MeetingID, TaskID, AssignedTo, Details, Name

// Each task has one meeting and one assigned user that it relates to, although names can be shared
// Each meeting has a unique ID, and is findable as a unique combination for the Creator's name and the MeetingName

const submitTask = function( e ) { // Submit request for a new task for a user
  // prevent default form action from being carried out
  e.preventDefault()

  const nameInput = document.querySelector( '#meetingname' ),
        userInput = document.querySelector( '#userInput' ),
        taskInput = document.querySelector( '#yourgrade' ),
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
    let myTable = '<table class ="pageText"><tr><td>Task ID:</td>';
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
        json = { name: removeInput.value};

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
        view(e);
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

/*const submit = function( e ) { // Submit request for a new or updated student's grades
  // prevent default form action from being carried out
  e.preventDefault()

  const nameInput = document.querySelector( '#meetingname' ),
        gradeInput = document.querySelector( '#yourgrade' ),
        json = { yourname: nameInput.value,  yourgrade: gradeInput.value },
        body = JSON.stringify( json );

  fetch( '/submit', {
    method:'POST',
    body: JSON.stringify( json ),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' 
  })
  .then( function( response ) {
    // Inform the user of what the letter grade of the student is, and
    // refresh the table view with the new student in it
    console.log( response );
    response.json().then((data) => {
      document.getElementById("tablePrint").innerHTML = '<table></table>';
      if (!isHidden) {
        view(e);
      }
      alert("The grade of this student is : "
              + data.numericGrade + " (" + data.letterGrade + ")");
    });
  });
  return false;
}

const view = function(e) {
  e.preventDefault();
  let studentArray;

  fetch( '/view', {
    method:'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  })
  .then( function( response ) {
    
    // Fetch all students in the database to add to a table
    console.log( response );
    response.json().then((data) => {
      console.log(data);
      studentArray = data.studentArray;
      let numStudents = studentArray.length;
    let myTable = '<table class ="pageText"><tr><td>Name:</td>';
    myTable += "<td>Grade:</td>";
    myTable += "<td>Letter Grade:</td></tr>";
    for (let i = 0; i < numStudents; i++) { // Make the table with one row per student
      myTable += "<tr><td>" + studentArray[i].name + "</td>";
      myTable += "<td>" + studentArray[i].number + "</td>";
      myTable += "<td>" + studentArray[i].letter + "</td></tr>";
    }
    myTable += "</table>";
    document.getElementById("tablePrint").innerHTML = myTable;
    isHidden = false;
    });
  });
  return false;
}

const deleteFunc = function( e ) { // Delete a student with an enetered name
  // prevent default form action from being carried out
  e.preventDefault();

  const removeInput = document.querySelector( '#removename' ),
        json = { name: removeInput.value};

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
        view(e);
      }
    });
  });
  return false;
}

const hide = function( e ) {
  e.preventDefault();
  document.getElementById("tablePrint").innerHTML = '<table></table>';
  isHidden = true;
}

window.onload = function() { // Link each button to its respective function
  const inButton = document.querySelector( '#inputButton' );
  const viButton = document.querySelector( '#viewButton' );
  const deButton = document.querySelector( '#removeButton' );
  const hiButton = document.querySelector( '#hideButton' );
  hiButton.onclick = hide;
  viButton.onclick = view;
  inButton.onclick = submit;
  deButton.onclick = deleteFunc;
}*/
