// Code specifically for messages that the user has received

// Note that we don't allow for users to send messages themselves, but messages will be automatically
// generated for them whenever they are assigned a task in another meeting
let isHidden = true;

const submit = function( e ) { // Submit request for a new or updated student's grades
  // prevent default form action from being carried out
  e.preventDefault()

  const nameInput = document.querySelector( '#yourname' ),
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

// Get all messages from the db
const view = function(e) {
  e.preventDefault();

  fetch( '/viewMessages', {
    method:'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  })
  .then( function( response ) {
    
    // Fetch all students in the database to add to a table
    console.log( response );
    response.json().then((data) => {
      console.log(data);
      let messagesArray = data.messagesArray;
      let numStudents = messagesArray.length;
    let myTable = '<table class ="pageText"><tr><td>From:</td>';
    myTable += "<td>Contents:</td></tr>";
    for (let i = 0; i < numStudents; i++) { // Make the table with one row per student
      myTable += "<tr><td>" + messagesArray[i].name + "</td>";
      myTable += "<td>" + messagesArray[i].number + "</td>";
      myTable += "<td>" + messagesArray[i].letter + "</td></tr>";
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

window.onload = function() { // Link each button to its respective function
  const viButton = document.querySelector( '#viewButton' );
  const hiButton = document.querySelector( '#hideButton' );
  hiButton.onclick = hide;
  viButton.onclick = view;
}
