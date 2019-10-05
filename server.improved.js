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
app.use(favicon(path.join(__dirname, 'assets', '3a7a7745-805f-4bc9-9091-f891637e22a2%2FfaviconCheck.ico?v=1570204892951')));
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
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT);');
    db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT, receiver TEXT, contents TEXT);');
    db.run('CREATE TABLE IF NOT EXISTS meetings (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, username TEXT, date TEXT, details TEXT);');
    db.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, taskName TEXT, assigneeName TEXT, username TEXT, meetingName TEXT, details TEXT);');
    // Default Users:
    // Username: User1
    // Password: Password1
    //
    // Username: charlie
    // Password: charliee

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

router.get('/mainview.html', function(request, response) {
  if (!request.user) {
    response.sendFile( __dirname + '/public/index.html' );
  } else {
    response.sendFile( __dirname + '/public/mainview.html' );
  }
})

router.get('/meetingview.html', function(request, response) {
  if (!request.user) {
    response.sendFile( __dirname + '/public/index.html' );
  } else {
    response.sendFile( __dirname + '/public/meetingview.html' );
  }
})

router.get('/calendarview.html', function(request, response) {
  if (!request.user) {
    response.sendFile( __dirname + '/public/index.html' );
  } else {
    response.sendFile( __dirname + '/public/calendarview.html' );
  }
})

router.get('/messagesview.html', function(request, response) {
  if (!request.user) {
    response.sendFile( __dirname + '/public/index.html' );
  } else {
    response.sendFile( __dirname + '/public/messagesview.html' );
  }
})

// Explicitly handle the index file
router.get('/', function(request, response) {
  response.sendFile( __dirname + '/public/index.html' );
})

router.get('/index.html/', function(request, response) {
  response.sendFile( __dirname + '/public/index.html' );
})

// View all of the messages that are intended for this user
app.post('/viewMessages', function(request, response) {
  let resp;
  response.writeHead( 200, "OK", {'Content-Type': 'application/json' });
  db.all('SELECT * from messages WHERE username = ? ', request.user.username, function(err, rows) {
    if (rows === undefined) {
      rows = [];
    }
    console.log(rows);
    console.log(request.user.username);
    resp = '{ "messagesArray": '+ JSON.stringify(rows) + ' }';
    console.log(resp);
    response.end(resp, 'utf-8');
  });
})

// View all of the tasks associated with a given meeting
app.post('/viewTasks', function(request, response) {
  let resp;
  response.writeHead( 200, "OK", {'Content-Type': 'application/json' });
  db.all('SELECT * from tasks WHERE username = ? AND meetingName = ?', request.user.username, request.body.meeting, function(err, rows) {
    if (rows === undefined) {
      rows = [];
    }
    console.log(rows);
    console.log(request.user.username);
    resp = '{ "tasksArray": '+ JSON.stringify(rows) + ' }';
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

// Add a new task for a user for a given meeting
// taskName TEXT, assigneeName TEXT, username TEXT, meetingName TEXT, details TEXT
app.post( '/submitTask', function( request, response ) {
  let resp;
  let newTaskMSG = "You have been assigned a task " + request.body.task + ", for the meeting " + request.body.meeting;
  db.run('INSERT INTO messages (sender, receiver, contents) VALUES ("' + request.user.username + '","' + request.body.name + '","' + newTaskMSG + '")');
  db.run('INSERT INTO tasks (taskName, assigneeName, username, meetingName, details) VALUES ("' + request.body.task + '","' + request.body.name + '","' + request.user.username + '","' + request.body.meeting + '","' + request.body.details + '")');
  response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
  response.end(resp, 'utf-8');
})

// submit a meeting, but only make it if its name is unique for this user
app.post( '/submitMeeting', function( request, response ) {
  let resp;
  db.get('SELECT * FROM meetings WHERE username=? AND name=?', request.user.username, request.body.name, function(err, row) {
     if (row) {
      resp = '{"meetingAdded":' + false + '}';
      response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
      response.end(resp, 'utf-8');
    } else {
      db.run('INSERT INTO meetings (username, name, date, details) VALUES ("' + request.user.username + '","' + request.body.name + '","' + request.body.date + '","' + request.body.details + '")');
      resp = '{"meetingAdded":' + true + '}';
      response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
      response.end(resp, 'utf-8');
    }
  })
})

// Remove a task that belongs to the given user and meeting
app.delete('/removeTask', function( request, response ) {

console.log(request.body.name);
  db.run('DELETE FROM tasks WHERE name=? AND task=? AND meeting=? AND username=?', request.body.name, request.body.task, request.body.meeting, request.user.username, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) deleted ${this.changes}`);
    let deleteMSG = "The task " + request.body.task + " that you were assigned for the meeting " + request.body.meeting + " has been removed.";
    db.run('INSERT INTO messages (sender, receiver, contents) VALUES ("' + request.user.username + '","' + request.body.name + '","' + deleteMSG + '")');
    response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
    response.end('{"removed": "done"}', 'utf-8');
  });
})

// Remove a meeting, and all associated tasks
app.delete('/removeMeeting', function( request, response ) {

console.log(request.body.name);
  db.run('DELETE FROM meetings WHERE name=? AND date=? AND username=?', request.body.name, request.body.date, request.user.username, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) deleted ${this.changes}`);
    db.run('DELETE FROM tasks WHERE meeting=? AND username=?', request.body.name, request.user.username, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) deleted ${this.changes}`);
    response.writeHead( 200, "OK", {'Content-Type': 'text/plain' });
    response.end('{"removed": "done"}', 'utf-8');
    });
  });
})

app.post('/login', passport.authenticate( 'local' ), function( req, res ) {
    console.log( 'user:', req.user );
    res.json({ status:true });
})

app.use( express.static( 'public' ) );

app.listen( process.env.PORT );
