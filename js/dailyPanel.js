let dailyArray = [];
let idleArray = [];
let todoArray = [];

//get logs from server
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

//uploads dailyArray
function createDailyList(logData) {
    //accepted statuses: todo, proceeded, finished
    dailyArray = []
    let logsWithRequiredStatus = logData.filter(log => (log.label == "todo" || log.label == "proceed" || log.label == "finished"));
    //sorted by timestamp
    logsWithRequiredStatus.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    for (let i = 0; i < logsWithRequiredStatus.length; i++) {
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
        }
    }
}

//creates the idleArray with idle items
function checkAndPutIdleForNextDays(dailyArrayItem) {
    let today = getFormattedCurrentDataAndTime(new Date()).substr(0, 10);
    let checkedLabel;
    let idle_counter = 0;
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
            idle_counter++;
            idleItem.timestamp = getFormattedCurrentDataAndTime(checkedDay);
            idleItem.todoID = dailyArrayItem.todoID;
            idleItem.label = dailyArrayItem.label + idle_tag;
            idleItem.idle_counter = idle_counter;
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

//creates DailyPanel according to the merged dailyArray and idleArray
function createDailyPanel() {
    let dailyContainer = document.querySelector("#dailyContainer");
    dailyContainer.innerHTML = "";
    if (dailyArray.length != 0) {
        // console.log("Összes elem: ", dailyArray);
        //it is the first/initial day and the next day
        let currentDay = dailyArray[0].timestamp.substr(0,10);
        let tomorrow = new Date();
        while(new Date(currentDay) <= new Date()){
            let filteredList = getSortedDailyItems(currentDay);
            if (filteredList){
                addDayDiv(currentDay);
                // console.log(currentDay, " ==> ", filteredList);
                for (let i = 0; i < filteredList.length; i++) {
                    todoDate = filteredList[i].timestamp.substr(0,10);
                    if (todoDate > currentDay) {
                        currentDay = todoDate;
                        addDayDiv(currentDay);
                    }
                    let todoID = filteredList[i].todoID;
                    let todo = todoArray.find(({ id }) => id == todoID);
                    addDailyItem(todo.name, filteredList[i]);
                }
            }
            //napot léptetünk
            tomorrow.setDate(new Date(currentDay).getDate() + 1);
            currentDay = getFormattedCurrentDataAndTime(tomorrow).substr(0,10);
        }



        // addDayDiv(currentDay);
        // for (let i = 0; i < dailyArray.length; i++) {
        //     todoDate = dailyArray[i].timestamp.substr(0,10);
        //     if (todoDate > currentDay) {
        //         currentDay = todoDate;
        //         addDayDiv(currentDay);
        //     }
        //     let todoID = dailyArray[i].todoID;
        //     let todo = todoArray.find(({ id }) => id == todoID);
        //     addDailyItem(todo.name, dailyArray[i]);
        // }
    }
}

//filter the items on the currentDay
//and returns an array where the items are sorted by label
function getSortedDailyItems(currentDay){
    let tomorrow = new Date();
    tomorrow.setDate(new Date(currentDay).getDate() + 1);
    let nextDay = getFormattedCurrentDataAndTime(tomorrow).substr(0,10);
    let itemsToBeListed = [];
    let filteredItemsByDate = [];
    let filteredItemsByLabel = [];
    filteredItemsByDate = dailyArray.filter(logItem => logItem.timestamp >= currentDay && logItem.timestamp < nextDay);
    if(filteredItemsByDate.length > 0){
        labels = ["proceedidle", "todoidle", "finished", "proceed", "todo"];
        for(let i = 0; i<5; i++){
            filteredItemsByLabel = [];
            filteredItemsByLabel = filteredItemsByDate.filter(logItem => logItem.label == labels[i]);
            if(filteredItemsByLabel.length > 0){
                //checking finished items if there are equals itmes
                if(i==2){
                    let mergedFinishedItems = [];
                    for(let item of filteredItemsByLabel){
                        if(mergedFinishedItems.find(logItem => logItem.todoID == item.todoID)){
                            mergedFinishedItems.find(logItem => logItem.todoID == item.todoID).occurence++;
                        }else{
                            item.occurence = 1;
                            mergedFinishedItems.push(item);
                        }
                    }
                    itemsToBeListed = itemsToBeListed.concat(mergedFinishedItems);
                    //console.log("finished... ", mergedFinishedItems);
                }else{
                    itemsToBeListed = itemsToBeListed.concat(filteredItemsByLabel);
                }
            }
        }
        return itemsToBeListed;
    }else{
        return null;
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

//get the todo list to get todo info
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

function addDailyItem(todoName, dailyItem) {
    let dailyContainer = document.querySelector("#dailyContainer");
    let newDailyItem = document.createElement("div");
    newDailyItem.setAttribute("class", `dailyItem-${dailyItem.label}`);
    if (dailyItem.label.includes("idle")) {
        let idleSpan = document.createElement("span");
        idleSpan.innerHTML = "[idle " + dailyItem.idle_counter + "]";
        idleSpan.setAttribute("class", "idleSpan");
        newDailyItem.innerHTML = todoName;
        newDailyItem.appendChild(idleSpan);
    } else {
        if(dailyItem.label == "finished" && dailyItem.occurence > 1){
            let occurenceSpan = document.createElement("span");
            occurenceSpan.innerHTML = "x" + dailyItem.occurence;
            occurenceSpan.setAttribute("class", "occurenceSpan");
            newDailyItem.innerHTML = todoName;
            newDailyItem.appendChild(occurenceSpan);
        }else{
            newDailyItem.innerHTML = todoName;
        }
    }
    dailyContainer.appendChild(newDailyItem);
    dailyContainer.scrollTo(0, dailyContainer.scrollHeight);
}

function refreshDailyPanel(log) {
    uploadDailyArray(log);
    uploadTodoArray();
}