let dailyArray = [];
let idleArray = [];
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
        uploadTodoArray();
    });
}

function createDailyList(logData) {
    //accepted statuses: todo, proceeded, finished
    dailyArray = []
    let logsWithRequiredStatus = logData.filter(log => (log.label == "todo" || log.label == "proceed" || log.label == "finished"));
    //sorted by timestamp
    logsWithRequiredStatus.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    //console.log("sorted list: ", logsWithRequiredStatus);
    for (let i = 0; i < logsWithRequiredStatus.length; i++) {
        //logsWithRequiredStatus[i].timestamp = logsWithRequiredStatus[i].timestamp.substr(0, 10);
        uploadDailyArray(logsWithRequiredStatus[i]);
    }
    addIdleItems();
    //if there are idle items
    //merge the arrays and sort by date
    if (idleArray.length > 0) {
        dailyArray = dailyArray.concat(idleArray);
        dailyArray = dailyArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
}
//if a log remains in todo or proceed state
//the next days will be checked and add idle items if there is no change
function addIdleItems() {
    idleArray = [];
    for (let i = 0; i < dailyArray.length; i++) {
        if (dailyArray[i].label == "todo" || dailyArray[i].label == "proceed") {
            //put idle logs until find proceed or finished label
            checkAndPutIdleForNextDays(dailyArray[i]);
            //} else if (dailyArray[i].label == "proceed") {
            //put idle logs until find finished label

        }
    }
    // console.log("Idles: ", idleArray);

}
function checkAndPutIdleForNextDays(dailyArrayItem) {
    let today = getFormattedCurrentDataAndTime(new Date()).substr(0, 10);
    let checkedLabel;
    let idle_tag = "idle";
    if (dailyArrayItem.label == "todo") {
        checkedLabel = "proceed"
    } else {
        checkedLabel = "finished"
    }
    // console.log("daily item's ",dailyArrayItem.todoID," label ", dailyArrayItem.label, " ch lab: ", checkedLabel);
    let checkedDay = new Date(dailyArrayItem.timestamp);
    checkedDay.setDate(checkedDay.getDate() + 1);
    let checkedDayString = getFormattedCurrentDataAndTime(checkedDay).substr(0, 10);
    while (checkedDayString <= today) {
        let foundIdx = dailyArray.findIndex(obj => 
            obj.todoID == dailyArrayItem.todoID &&
            (obj.label == checkedLabel || obj.label == "finished") &&
            obj.timestamp.substr(0, 10) == checkedDayString);
        if (foundIdx == -1) {
            //add idle log
            let idleItem = {};
            idleItem.timestamp = getFormattedCurrentDataAndTime(checkedDay);
            idleItem.todoID = dailyArrayItem.todoID;
            idleItem.label = dailyArrayItem.label + idle_tag;
            idleArray.push(idleItem);
            //console.log("adding idle ", dailyArrayItem.todoID, " label ", dailyArrayItem.label, " checked lab: ", checkedLabel);
            //and check the next day
            checkedDay.setDate(checkedDay.getDate() + 1);
            checkedDayString = getFormattedCurrentDataAndTime(checkedDay).substr(0, 10);
            //console.log(":::", checkedDayString);
        } else {
            //no need to continue to search
            break;
        }
    }

}

function uploadDailyArray(logItem) {
    if (logItem.label == "todo") {
        dailyArray.push(logItem);
    } else if (logItem.label == "proceed") {
        checkAndReplace(logItem, "todo");
    } else if (logItem.label == "finished") {
        checkAndReplace(logItem, "proceed");
    }
}
// check if there is todo label on the same day and with the same todoID
// if so, delete it
function checkAndReplace(currentLog, oldLabel) {
    let foundIdx = dailyArray.findIndex(obj => 
        obj.todoID == currentLog.todoID &&
        obj.label == oldLabel &&
        isOnTheSameDay(obj.timestamp, currentLog.timestamp) &&
        new Date(obj.timestamp) < new Date(currentLog.timestamp)
        );
    if (foundIdx != -1) {
        dailyArray[foundIdx] = currentLog;
    } else {
        dailyArray.push(currentLog);
    }
}

function isOnTheSameDay(timestamp1, timestamp2){
    if(timestamp1.substr(0,10)==timestamp2.substr(0,10)){
        return true;
    }else{
        return false;
    }
}

function createDailyPanel() {
    let dailyContainer = document.querySelector("#dailyContainer");
    dailyContainer.innerHTML = "";
    if (dailyArray.length != 0) {
        let currentDay = dailyArray[0].timestamp.substr(0,10);
        addDayDiv(currentDay);
        for (let i = 0; i < dailyArray.length; i++) {
            todoDate = dailyArray[i].timestamp.substr(0,10);
            if (todoDate > currentDay) {
                currentDay = todoDate;
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
    if (label.includes("idle")) {
        let idleSpan = document.createElement("span");
        idleSpan.innerHTML = "[idle]";
        idleSpan.setAttribute("class", "idleSpan");
        newDailyItem.innerHTML = todoName;
        newDailyItem.appendChild(idleSpan);
    } else {
        newDailyItem.innerHTML = todoName;
    }
    dailyContainer.appendChild(newDailyItem);
    dailyContainer.scrollTo(0, dailyContainer.scrollHeight);
}

function refreshDailyPanel(log) {
    uploadDailyArray(log);
    uploadTodoArray();
}