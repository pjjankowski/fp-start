const express    = require('express'),
      app        = express(),
      bodyparser = require( 'body-parser' ),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      sqlite3 = require('sqlite3').verbose(),
      session = require('express-session'),
      responseTime = require('response-time'),
      favicon = require('serve-favicon'),
      path = require('path'),
      helmet = require('helmet'),
      slash = require('express-slash'),
      morgan = require('morgan'),
      compression = require('compression');

// Display all requests made in the server console
app.use(morgan('combined'));
// Compression allows for responses to be sent more quickly
app.use(compression());
//Adds in the favicon from a local file, rather than a URL
app.use(favicon(path.join(__dirname, 'assets', '5cd46ecf-8f21-44d2-941d-1799ff06883e%2Ffavicon-a3.ico?v=1568478368998')));
//Adds in helmet security headers automatically
app.use(helmet());
//
// Show response time as a response header x-response-time
app.use(responseTime());
app.use( bodyparser.json() );
// Set up a user session, authenticated with passport
app.use( session({ secret:'secretSession', resave:false, saveUninitialized:false }) )
app.use(passport.initialize());
app.use(passport.session());

// Open database in memory
let db = new sqlite3.Database('./student.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

db.serialize(function(){
    db.run('CREATE TABLE IF NOT EXISTS Grades (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, number TEXT NOT NULL, letter TEXT NOT NULL, username TEXT);');
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT);');
    
    // Default Users:
    // Username: User1
    // Password: Password1
    // Students: John Doe, grade of 75
    //
    // Username: charlie
    // Password: charliee
    // Students: John Doe, grade of 81, and Mary Sue, grade of 99.9

    db.each('SELECT * from Grades', function(err, row) {
      if ( row ) {
        console.log('Initial Student:', row);
      }
    });
  db.each('SELECT * from users', function(err, row) {
      if ( row ) {
        console.log('Initial Users:', row);
      }
    });
});

// Set up the local strategy for logins using the database
passport.use(new LocalStrategy(function(username, password, done) {
  db.get('SELECT password FROM users WHERE username = ?', username, function(err, row) {
    if (!row) {
      console.log("not found:");
      return done(null, false);
    } else {
      db.get('SELECT username, id FROM users WHERE username = ? AND password = ?', username, password, function(err, row) {
      if (!row) {
        return done(null, false);
      }
      return done(null, row);
      });
    }
  });
}));
passport.initialize();

passport.serializeUser(function(user, done) {
  return done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.get('SELECT id, username FROM users WHERE id = ?', id, function(err, row) {
    if (!row) {
      return done(null, false);
    }
    return done(null, row);
  });
});

const alphaFunc = function (grade) {
    // Get the letter for a student's grade
    let letter;
    if (grade >= 90) {
      letter = "A";
    } else if (grade >= 80) {
      letter = "B";
    } else if (grade >= 70) {
      letter = "C";
    } else if (grade >= 60) {
      letter = "D";
    } else if (grade > -1 && grade !== '') {
      letter = "F";
    } else {
      letter = "N/A";
    }
  return letter;
}

// Helper function that adds the user to the database
const dbAddFunc = function(name, number, letter, user) {
  db.run('INSERT INTO Grades (name, number, letter, username) VALUES ("' + name + '","' + number + '","' + letter + '","' + user + '")');
  db.each('SELECT * from users', function(err, row) {
      if ( row ) {
        console.log('Initial Users:', row);
      }
    });
}

// Enforce strict routing for express-slash
app.enable('strict routing');

// Creating a router using express-slash middleware to handle extra or omitted
// slashes, (/) in the url
const router = express.Router({
    caseSensitive: app.get('case sensitive routing'),
    strict       : app.get('strict routing')
});

app.use(router);
app.use(slash());

router.get('/loggedIn.html', function(request, response) {
  if (!request.user) {
    response.sendFile( __dirname + '/public/index.html' );
  } else {
    response.sendFile( __dirname + '/public/loggedIn.html' );
  }
})

// Explicitly handle the index file
router.get('/', function(request, response) {
  response.sendFile( __dirname + '/public/index.html' );
})

router.get('/index.html/', function(request, response) {
  response.sendFile( __dirname + '/public/index.html' );
})

// View all of the students that have been entered by this user
app.post('/view', function(request, response) {
  let resp;
  response.writeHead( 200, "OK", {'Content-Type': 'application/json' });
  db.all('SELECT * from Grades WHERE username = ? ORDER BY name ASC', request.user.username, function(err, rows) {
    if (rows === undefined) {
      rows = [];
    }
    console.log(rows);
    console.log(request.user.username);
    resp = '{ "studentArray": '+ JSON.stringify(rows) + ' }';
    console.log(resp);
    response.end(resp, 'utf-8');
  });
})

// Add a new user account
app.post( '/signup', function( request, response ) {
  let dataString = '';

  request.on( 'data', function( data ) {
      dataString += data; 
  })
  request.on( 'end', function() {
  let resp;
  let data = JSON.parse( dataString );
    let inserted;
    let val;
    // See if the user is in the database
  db.get('SELECT password FROM users WHERE username = ?', data.username, function(err, row) {
     if (row) {
      val = 1;
      resp = '{"userAdded":' + false + '}';
      response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
      response.end(resp, 'utf-8');
    } else {
      // If the user is not in the database, make a new user
     db.run('INSERT INTO users (username, password) VALUES ("' + data.username + '","' + data.password + '")');
     console.log("new user entered");
      resp = '{"userAdded":' + true + '}';
      response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
      response.end(resp, 'utf-8');
    }
    console.log(val);
    return val;
  })
  })
})

// Remove the previous student with the given name, (if any), and add a new one with the entered grade
app.post( '/submit', function( request, response ) {
  let resp;
  let letter = alphaFunc(request.body.yourgrade);
  db.run('DELETE FROM Grades WHERE name=? AND username=?', request.body.yourname, request.user.username, function(err) {
    if (err) {
      return console.error(err.message);
    }
  });
  // Add in the student with the data provided
  dbAddFunc(request.body.yourname, request.body.yourgrade, letter, request.user.username);
  resp = '{"letterGrade":"'+ letter + '",';
  resp += '"studentName":"' + request.body.yourname + '", ';
  resp += '"numericGrade":"' + request.body.yourgrade + '"}';
  response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
  response.end(resp, 'utf-8');
})

// Remove a student that belongs to the given user
app.delete('/remove', function( request, response ) {

console.log(request.body.name);
  db.run('DELETE FROM Grades WHERE name=? AND username=?', request.body.name, request.user.username, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) deleted ${this.changes}`);
    response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
    response.end('{"removed": "done"}', 'utf-8');
  });
})

app.post('/login', passport.authenticate( 'local' ), function( req, res ) {
    console.log( 'user:', req.user );
    res.json({ status:true });
})

app.use( express.static( 'public' ) );

app.listen( process.env.PORT );
