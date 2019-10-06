// Here is where the js should go for viewing weeks in the calendar
// display the days events
let buildCal = function (myCal){

    let endDays[j] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let monthName[i] = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    let year = 2019;
    let isLeapYear = false;

    let calendar = new Object(myCal);
    calendar.currentDay="";
    calendar.monthName = myCal.monthName[11];
    calendar.isLeapYear = "";

    const canvas = document.getElementById('myCanvas');

    const ctx = canvas.getContext('2d');
    canvas.height = "";
    canvas.width="";
    canvas.fillStyle='white';
    canvas.fillRect(50,50,100,150);
    canvas.fill();
};

buildCal();

