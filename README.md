## Grade Tabler

https://a3-pjjankowski.glitch.me/

Original, assignment a2:
- This is a simple website prototype that allows for users to add students with a numeric grade, deriving and storing their letter grade as well.
- The website allows for users to easily add new students, modify their grades, and delete old students, while being able to view them in an HTML table.
- The students are automatically added to a table, which displays them in alphabetical order by name after the "Show Current Grade Table" button is clicked.
- The system has the basics required to add, modify, remove, and order students, and acheives its basic objective.
- All of the basic requirements for css usage are present, with various selectors and positioning options used.
- This site could be improved by allowing for different ordering of students, such as by numeric grade.
- This site would also be improved with some security measures for the user input, especially if the site became widely used.
- This site could also be expanded to give students grades in individual subjects, or by allowing individual databases with user logins to keep them private.

New, assignment a3:

The goal of this application was to provide users with a convenient way to enter, modify, and remove student grades, and view the students in alphabetical order.
This has been further extended by allowing for users to have their own students stored in a database, which only they can access.

The primary challenge in implementing this application was in using passport authentication to ensure each student was only tied to the user that entered the student's information.

Authentication strategy: Passport-local, since my application did not seem to necessitate logins that were more complicated that a simple username and password, making it the obvious choice.
Database used: Sqllite, with two tables in student.db, for user logins and students. Each student is associated with one user only.
The reason that I used sqllite is that I had already used it for my last project, and wanted to extend my usage of it further, this time adding a file for the database, rather than storing it in memory.

CSS Framework used: Bootstrap
There are no additional styling modifications by me outside of what Bootstrap has provided.
The reason why I chose to use bootstrap is that I saw an immediate use for its utility classes in simplifying my website's styling, and that its aesthetic is simple, without a theming that could be distracting. 


Express middleware packages used:
- body-parser, for parsing requests as JSON
- express-session, for enabling user sessions to be maintained on reloading the logged in page
- passport using the local strategy with passport-local,
- response-time, which allows you to see the time between each request and response in the networks tab of console, with header x-response-time
- helmet, which adds various security features in server headers, such as not allowing for the project to be displayed outside of its own window, and frameguard to prevent clickjacking.
- serve-favicon, which automatically handles browser requests for favicon.ico and allows you to add the favicon to the server from a local file. This uses the path module for nodejs. 
- express-slash, which automatically redirects users if their url is missing a slash at the end
- morgan, for automatically logging all requests made to the server in the server console, useful for debugging
- compression, which compresses server responses for faster transfers, particularly useful if sending lots of students on opening the table to view it


Default Users:
     Username: User1
     Password: Password1
     Students: John Doe, grade of 75
     Username: charlie
     Password: charliee
     Students: John Doe, grade of 81, and Mary Sue, grade of 99.9
http://a3-pjjankowski.glitch.me

An example table might be as follows:

![Image of Example Table](https://cdn.glitch.com/5cd46ecf-8f21-44d2-941d-1799ff06883e%2FGradeTable.PNG?v=1568587030243)


## Technical Achievements
- **Tech Achievement 1**: Extended my sqllite database from the previous assignment to use a file, rather than persisting in memory.
- **Tech Achievement 2**: Using 9 expressjs middleware packages, (more if you count passport and passport-local as seperate, 
along with the node package path needed for serve-favicon). I wanted to ensure that my site had some basic features in security and 
debug information, so I added helmet for some security related response headers, and the packages morgan and response-time for console
and network information. serve-favicon and express-slash are convenient ways to handle the favicon from a local file and URL entries 
missing the ending slash.
### Design/Evaluation Achievements
- **Design Achievement 1**: For accessibility, all colors have a contrast ratio rating that is above the AAA standard, 
and I have replaced all div and span elements in my document with alternatives. There are no images in my document that require alterative text.
- **Design Achievement 2**: Following feedback on my last assignment's styling from 2 test users, I found that they saw it as more 
intuitive to have the buttons to show and hide the table closer to the remove button, but still above the table. I also changed my 
color scheme since the background color was disliked and the buttons were seen as plain. Finally, I changed the starting text in the 
input fields for adding and removing users to be placeholders, not default values.