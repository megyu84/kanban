let todos = [];
let proceedTodos = [];
let finishedTodos = [];
let savedTodos = [];
let removedTodos = [];
//-------------------------------------------------------
//-------------------F-U-N-C-T-I-O-N-S------------------
//-------------------------------------------------------
function initTodoList(todoListFromServer) {
    todos = [];
    proceedTodos = [];
    finishedTodos = [];
    savedTodos = [];
    removedTodos = [];
    for (let i = 0; i < todoListFromServer.length; i++) {
        if (todoListFromServer[i].status == "todo") {
            todos.push(todoListFromServer[i]);
        } else if (todoListFromServer[i].status == "proceed") {
            proceedTodos.push(todoListFromServer[i]);
        } else if (todoListFromServer[i].status == "finished") {
            finishedTodos.push(todoListFromServer[i]);
        } else if (todoListFromServer[i].status == "saved") {
            savedTodos.push(todoListFromServer[i]);
        } else {
            removedTodos.push(todoListFromServer[i]);
        }
    }
    uploadTable();
    uploadSavedTodos();
    initDailyPanel();
}


function updateDB(todo) {
    let fetchOptions = {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(todo)
    };
    fetch("http://localhost:3000/todoList/" + todo.id, fetchOptions)
        .then(resp => resp.json())
        .then(resp => {
            loadData();
            addNewLogItem(todo)
        });

}

function removeTodo(todo) {
    let todoName = todo.name;
    todo.status = "removed";
    showNewTodoAlert(true, `"${todoName}" todo törölve`, "red");
    updateDB(todo);
    // addNewLogItem(todo);
}
function loadData() {
    let fetchInit = {
        method: "GET",
        headers: new Headers(),
        mode: "cors",
        cache: "default"
    };
    const fetchData = fetch("http://localhost:3000/todoList", fetchInit);
    fetchData.then(data => data.json()).then(data => initTodoList(data));
}




//pushing enter key to add a new todo
let newTodoInput = document.querySelector("#newTodoInput");
newTodoInput.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        addNewTodo("todo");
    }
}
);


function loadLogDB() {
    let fetchInit = {
        method: "GET",
        headers: new Headers(),
        mode: "cors",
        cache: "default"
    };
    const fetchData = fetch("http://localhost:3000/log", fetchInit);
    fetchData.then(data => data.json()).then(
        data => initLogDiv(data),
        error => console.log("log olvasási hiba ", error)
    );
}
function initLogDiv(data) {
    // let logContainer = document.querySelector("#logContainer");
    let allTodos = todos.concat(proceedTodos, finishedTodos, savedTodos, removedTodos);
    for (let logItem of data) {
        let todoID = logItem.todoID;
        //let todoName = allTodos.find(todoItem => todoItem.id == todoID).name;
        let todo = allTodos.find(({ id }) => id == todoID);
        //let todoName = result.name;
        //console.log("Amit keresünk: ", todoName);
        // logContainer.innerText += todoName + "\n";
        createNewLogSpan(logItem, todo);
    }
}
function addNewLogItem(todo) {
    //console.log("new log: ", todo);
    let logItem = createLogItem(todo);
    let fetchOptions = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(logItem)
    };
    fetch("http://localhost:3000/log/", fetchOptions)
        .then(
            resp => resp.json(),
            err => console.error("xxx", err)
        )
        .then(
            json => {
                console.log(json);
                createNewLogSpan(logItem);
                refreshDailyPanel(logItem);
            },
            err => console.error("...", err)
        );


}
function createNewLogSpan(logItem) {
    logDiv = document.createElement("div");
    logDiv.setAttribute("class", "logDiv");

    timestampSpan = document.createElement("span");
    timestampSpan.setAttribute("class", "timestampSpan");
    timestampSpan.innerText = logItem.timestamp.substr(0, 10);

    labelSpan = document.createElement("span");
    labelSpan.setAttribute("class", `${logItem.label}LabelSpan labelSpan`);
    labelSpan.innerText = getLabel(logItem.label);

    todoSpan = document.createElement("span");
    todoSpan.setAttribute("class", "todoSpan");

    // todoSpan.innerText = todo.name;
    let allTodos = todos.concat(proceedTodos, finishedTodos, savedTodos, removedTodos);

    let findTodo = allTodos.find(({ id }) => id == logItem.todoID);
    //console.log(findTodo.name);
    todoSpan.innerText = findTodo.name;
    logDiv.appendChild(timestampSpan);
    logDiv.appendChild(labelSpan);
    logDiv.appendChild(todoSpan);

    // logDiv.innerText += todo.name + "\n";
    let logContainer = document.querySelector("#logContainer");
    logContainer.appendChild(logDiv);
    logContainer.scrollTo(0, logContainer.scrollHeight);
}
function getLabel(todoStatus) {
    if (todoStatus == "removed") {
        return "Törölve";
    } else if (todoStatus == "todo") {
        return "Hozzáadva";
    } else if (todoStatus == "proceed") {
        return "Elkezdve";
    } else if (todoStatus == "saved") {
        return "Mentve";
    } else if (todoStatus == "finished") {
        return "Befejezve";
    } else {
        console.error("Azonosítatlan státusz");
        return "undefined";
    }
}


function createLogItem(todo) {

    let log = {};
    log.timestamp = getFormattedCurrentDataAndTime(new Date());
    log.todoID = todo.id;
    log.label = todo.status;
    return log;
}

//get current date and time and returns it formatted form
function getFormattedCurrentDataAndTime(currentdate) {
    //let currentdate = new Date();
    let year = currentdate.getFullYear();
    let month = currentdate.getMonth();
    month++;
    if (month < 10) {
        month = "0" + month;
    }
    let day = currentdate.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    let hour = currentdate.getHours();
    if (hour < 10) {
        hour = "0" + hour;
    }
    let minute = currentdate.getMinutes();
    if (minute < 10) {
        minute = "0" + minute;
    }
    let sec = currentdate.getSeconds();
    if (sec < 10) {
        sec = "0" + sec;
    }
    //let ms = currentdate.getMilliseconds();

    let timestamp = year + "." + month + "." + day + " " + hour + ":" + minute + ":" + sec;
    return timestamp;
}
function selectIcon(selectedIcon) {
    let iconDiv = document.querySelector("#todoIconDiv");
    iconDiv.innerHTML = "";
    console.log(selectedIcon.getAttribute("src"));
    let todoIcon = document.createElement("img");
    todoIcon.setAttribute("src", selectedIcon.getAttribute("src"));
    todoIcon.setAttribute("id", "selectedTodoIcon");
    todoIcon.setAttribute("alt", selectedIcon.getAttribute("alt"));
    iconDiv.appendChild(todoIcon);
}
function toggleButtons(button1, button2) {
    button2.checked = false;
    button2.parentElement.setAttribute("class", "btn btn-light");
    button1.checked = true;
    button1.parentElement.setAttribute("class", "btn btn-light active");
}
function togglePanels(panel1, panel2) {
    panel1.style.display = 'none';
    panel2.style.display = 'block';
}

//watch screen size and change the place of the left and right panel if necessary
function checkScreenSize(){
    let rightPanelBigScreen = document.querySelector("#rightPanelBigScreen");
    let rightPanelSmallScreen = document.querySelector("#rightPanelSmallScreen");
    let rightPanel = document.querySelector("#rightPanel");
    
    let iconsForSmallScreen = document.querySelector("#iconsForSmallScreen");
    let iconsForBigScreen = document.querySelector("#iconsForBigScreen");
    let iconDiv = document.querySelector("#iconsDiv");

    if(window.innerWidth < 1200){
        rightPanelSmallScreen.appendChild(rightPanel);
        iconsForSmallScreen.appendChild(iconDiv);
    }else{
        rightPanelBigScreen.appendChild(rightPanel);
        iconsForBigScreen.appendChild(iconDiv);
    }
}

//----------------------------------------------------------
//----------------------------------------------------------
//----------------------------------------------------------
//----------------------------------------------------------
window.onresize = () => {
    checkScreenSize();
}

checkScreenSize();
showNewTodoAlert(false);
loadData();
loadLogDB();

//logViewButton
document.querySelector("#option1").onclick = function () {
    if (this.checked) {
        toggleButtons(this, document.querySelector("#option2"));
        let logContainer = document.querySelector("#logContainer");
        let dailyContainer = document.querySelector("#dailyContainer");
        togglePanels(dailyContainer, logContainer);
    }
};

//dailyViewButton
document.querySelector("#option2").onclick = function () {
    if (this.checked) {
        toggleButtons(this, document.querySelector("#option1"));
        let logContainer = document.querySelector("#logContainer");
        let dailyContainer = document.querySelector("#dailyContainer");
        togglePanels(logContainer, dailyContainer);
        dailyContainer.scrollTo(0, dailyContainer.scrollHeight);
    }
};
