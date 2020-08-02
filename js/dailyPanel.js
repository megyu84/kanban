let dailyArray = [];
let todoArray = [];
function initDailyPanel() {
    console.log("DAILY PANEL...");
    let fetchInit = {
        method: "GET",
        headers: new Headers(),
        mode: "cors",
        cache: "default"
    };
    const fetchData = fetch("http://localhost:3000/log", fetchInit);
    fetchData.then(data => data.json()).then(data => {
        createDailyList(data);
        // console.log(dailyArray);
        uploadTodoArray();
    });
}

function createDailyList(logData) {
    //accepted statuses: todo, proceeded, finished
    dailyArray = []
    let logsWithRequiredStatus = logData.filter(log => (log.label == "todo" || log.label == "proceed" || log.label == "finished"));
    //sorted by timestamp
    logsWithRequiredStatus.sort((a, b) => b.timestamp - a.timestamp);
    for (let i = 0; i < logsWithRequiredStatus.length; i++) {
        logsWithRequiredStatus[i].timestamp = logsWithRequiredStatus[i].timestamp.substr(0, 10);
        uploadDailyArray(logsWithRequiredStatus[i]);
    }
}

function uploadDailyArray(logItem) {
    if (logItem.label == "todo") {
        //DO NOTHING
        dailyArray.push(logItem);
        // console.log(logItem," added");
    } else if (logItem.label == "proceed") {
        // check if there is todo label on the same day and with the same todoID
        // if so, delete it
        checkAndReplace(logItem, "todo");
    } else if (logItem.label == "finished") {
        checkAndReplace(logItem, "proceed");
    }
}
function checkAndReplace(currentLog, oldLabel) {
    let foundIdx = dailyArray.findIndex(obj => obj.label == oldLabel &&
        obj.timestamp == currentLog.timestamp &&
        obj.todoID == currentLog.todoID);
    if (foundIdx != -1) {
        dailyArray[foundIdx] = currentLog;
    } else {
        dailyArray.push(currentLog);
    }
}
function createDailyPanel() {
    let dailyContainer = document.querySelector("#dailyContainer");
    dailyContainer.innerHTML = "";
    if (dailyArray.length != 0) {
        let currentDay = dailyArray[0].timestamp;
        addDayDiv(currentDay);
        for (let i = 0; i < dailyArray.length; i++) {
            if (dailyArray[i].timestamp > currentDay) {
                currentDay = dailyArray[i].timestamp;
                addDayDiv(currentDay);
            }
            let todoID = dailyArray[i].todoID;
            let todo = todoArray.find(({ id }) => id == todoID);
            addDailyItem(todo.name, dailyArray[i].label);
        }
    }
    
}
//day div in Daily panel
function addDayDiv(currentDay) {
    let dailyContainer = document.querySelector("#dailyContainer");
    let newDayDiv = document.createElement("div");
    newDayDiv.setAttribute("class", "dayDiv");
    getDayName(currentDay);
    newDayDiv.innerHTML = currentDay + ", " + getDayName(currentDay);
    dailyContainer.appendChild(newDayDiv);
}
function getDayName(currentDay) {
    let day = "";
    switch (new Date(currentDay).getDay()) {
        case 0:
            day = "Sunday";
            break;
        case 1:
            day = "Monday";
            break;
        case 2:
            day = "Tuesday";
            break;
        case 3:
            day = "Wednesday";
            break;
        case 4:
            day = "Thursday";
            break;
        case 5:
            day = "Friday";
            break;
        case 6:
            day = "Saturday";
    }
    return day;
}

function uploadTodoArray() {
    todoArray = [];
    let fetchInit = {
        method: "GET",
        headers: new Headers(),
        mode: "cors",
        cache: "default"
    };
    const fetchData = fetch("http://localhost:3000/todoList", fetchInit);
    fetchData.then(data => data.json()).then(todos => {
        todoArray = todos.slice();
        //console.log(todoArray);
        createDailyPanel();
    });
}

function addDailyItem(todoName, label) {
    let dailyContainer = document.querySelector("#dailyContainer");
    let newDailyItem = document.createElement("div");
    newDailyItem.setAttribute("class", `dailyItem-${label}`);
    newDailyItem.innerHTML = todoName;
    dailyContainer.appendChild(newDailyItem);
    dailyContainer.scrollTo(0, dailyContainer.scrollHeight);
    console.log("scrollh: ", dailyContainer.scrollHeight);
}

function refreshDailyPanel(log) {
    uploadDailyArray(log);
    uploadTodoArray();
}