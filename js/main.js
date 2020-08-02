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

// upload the saved todos
function uploadSavedTodos() {
    let savedDiv = document.querySelector("#savedDiv");
    savedDiv.innerHTML = "";
    console.log("saved:", savedTodos);
    for (savedTodo of savedTodos) {
        let span = document.createElement("span");
        setupSpanElement(span, savedTodo);
        savedDiv.appendChild(span);
    }
}

//setup the span element for saved todos
function setupSpanElement(span, todo) {
    if ('icon' in todo) {
        span.innerHTML = `<img class="todoIcon" src="/icon/${todo.icon}.png" width=30px alt="${todo.icon}">${todo.name}`;
    } else {
        span.innerHTML = todo.name;
    }
    span.setAttribute("class", "savedTodos");
    span.setAttribute("name", todo.name);
    span.style.cursor = "pointer";
    span.addEventListener("click", function (event) {
        moveToProceed(todo);
    });
}

// upload table with todo data 
function uploadTable() {
    let todoTable = document.querySelector("#todoTable tbody");
    todoTable.innerHTML = "";
    let maxArrayLength = setMaxElement();
    console.log(maxArrayLength);
    initTodoArrays(maxArrayLength);
    for (let i = 0; i < maxArrayLength; i++) {
        todoTable.appendChild(createTodoRow([todos[i], proceedTodos[i], finishedTodos[i]]));
    }

}
//define the longest array
function setMaxElement() {
    let max = todos.length;
    if (max < proceedTodos.length) {
        max = proceedTodos.length;
    }
    if (max < finishedTodos.length) {
        max = finishedTodos.length;
    }
    // console.log("Max = " + max);
    return max;
}
//fill the shorter arrays with ""
function initTodoArrays(max) {
    for (let i = 0; i < max; i++) {
        if (todos.length <= i) {
            todos[i] = "";
        }
        if (proceedTodos.length <= i) {
            proceedTodos[i] = "";
        }
        if (finishedTodos.length <= i) {
            finishedTodos[i] = "";
        }

    }
}

//change the status of the clicked element
function moveToProceed(todo) {
    if (todo.status == "todo") {
        todo.status = "proceed";
    } else if (todo.status == "proceed") {
        todo.status = "finished"
    } else if (todo.status == "finished") {
        todo.status = "saved"
    } else {
        todo.status = "todo"
    }
    console.log("current index is", todo.id, " new status is ", todo.status);
    updateDB(todo);
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
function createTodoRow(todos) {
    let tr = document.createElement("tr");
    for (let todo of todos) {
        let td = document.createElement("td");
        if (typeof todo.name == 'undefined') {
            td.innerText = "";
        } else {
            if ('icon' in todo) {
                console.log(todo, "This todo has an icon");
                td.innerHTML = `<img class="todoIcon" src="/icon/${todo.icon}.png" width=30px alt="${todo.icon}">${todo.name}`;
            } else {
                td.innerHTML = todo.name;
            }
            td.style.cursor = "pointer";
            td.setAttribute("name", todo.name);
            td.addEventListener("click", function (event) {
                moveToProceed(todo);
            });
            // td.addEventListener("mouseover", function (event) {
            //     td.style.textDecoration = "underline";
            // });
            td.addEventListener("mouseout", function (event) {
                td.style.textDecoration = "initial";
            });
        }
        tr.appendChild(td);
    }
    let buttonTd = document.createElement("td");
    if (todos[2].status == "finished") {
        let button = document.createElement("button");
        let icon = document.createElement("icon");
        icon.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';
        button.appendChild(icon);
        button.setAttribute("type", "button");
        button.setAttribute("class", "btn btn-danger");
        buttonTd.appendChild(button);
        buttonTd.addEventListener("click", function (event) {
            removeTodo(todos[2]);
        });
        buttonTd.addEventListener("mouseover", function (event) {
            tr.childNodes[2].style.backgroundColor = "rgba(249,172,196, 0.5)";
            tr.childNodes[2].style.color = "red";
            tr.childNodes[2].style.textDecoration = "underline";

        });
        buttonTd.addEventListener("mouseout", function (event) {
            tr.childNodes[2].style.backgroundColor = "transparent";
            tr.childNodes[2].style.color = "black";
            tr.childNodes[2].style.textDecoration = "initial";
        });
    } else {
        buttonTd.innerText = "";
    }
    tr.appendChild(buttonTd);
    return tr;
}
function removeTodo(todo) {
    let todoName = todo.name;
    todo.status = "removed";
    showNewTodoAlert(true, `"${todoName}" todo törölve`);
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

function addNewTodo() {
    let newTodo = document.querySelector("#newTodoInput");
    console.log("Todo: ", newTodo.value);
    let iconImg = document.querySelector("#selectedTodoIcon");
    console.log("Todo img: ", iconImg);

    let isExist = checkingNewTodoExist(newTodo.value);
    if (newTodo.value.trim() == "") {
        isExist = true;
        showNewTodoAlert(isExist, "Nincs használható tartalom.");
        console.log("Üres todo");
    }
    if (!isExist) {
        let todo;
        if (iconImg) {
            todo = { name: newTodo.value, status: "todo", icon: iconImg.getAttribute("alt") };
            //console.log(todo);
        } else {
            todo = { name: newTodo.value, status: "todo" };
        }
        let fetchOptions = {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(todo)
        };
        fetch("http://localhost:3000/todoList/", fetchOptions)
            .then(
                resp => resp.json(),
                err => console.error(err)
            )
            .then(json => {
                console.log(json);
                newTodo.value = "";
                loadData();
                todo.id = json.id;
                addNewLogItem(todo);
            });
    } else {
        showNewTodoAlert(isExist, "Ez a todo már létezik.");
        showExistingTodo(newTodo.value);
    }
    document.querySelector("#todoIconDiv").innerHTML = "";
}
//check if the new todo is unique
function checkingNewTodoExist(newtodo) {
    //console.log(newtodo);
    let allTodos = todos.concat(proceedTodos, finishedTodos, savedTodos);
    let existTodo = allTodos.some(todo => todo.name == newtodo);
    return existTodo;
}
function showNewTodoAlert(showAlert, message) {
    let newTodoAlert = document.querySelector("#newTodoAlert");
    if (showAlert) {
        newTodoAlert.innerText = message;
        newTodoAlert.style.visibility = "visible";
        setTimeout(function () { newTodoAlert.style.visibility = "hidden"; }, 2000);
    } else {
        newTodoAlert.style.visibility = "hidden";
    }
}
//pushing enter key to add a new todo
let newTodoInput = document.querySelector("#newTodoInput");
newTodoInput.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        addNewTodo();
    }
}
);
//indicates the already created todo
function showExistingTodo(todoName) {
    let td = document.querySelector(`.table td[name="${todoName}"]`);
    if (td == null) {
        //try to search in saved todos
        let span = document.querySelector(`.savedTodos[name="${todoName}"]`);
        if (span == null) {
            console.log("Todo is new.");
        } else {
            span.setAttribute("class", "alreadyExistingSpan savedTodos");
            setTimeout(function () { span.classList.remove("alreadyExistingSpan"); }, 4000);
        }
    } else {
        td.setAttribute("class", "alreadyExistingTd");
        setTimeout(function () { td.classList.remove("alreadyExistingTd"); }, 4000);

    }
}

function loadLogDB() {
    let fetchInit = {
        method: "GET",
        headers: new Headers(),
        mode: "cors",
        cache: "default"
    };
    const fetchData = fetch("http://localhost:3000/log", fetchInit);
    fetchData.then(data => data.json()).then(data => initLogDiv(data));
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
            err => console.error(err)
        )
        .then(json => {
            console.log(json);
        });
    createNewLogSpan(logItem, todo);
    refreshDailyPanel(logItem);


}
function createNewLogSpan(logItem, todo) {
    logDiv = document.createElement("div");
    logDiv.setAttribute("class", "logDiv");

    timestampSpan = document.createElement("span");
    timestampSpan.setAttribute("class", "timestampSpan");
    timestampSpan.innerText = logItem.timestamp;

    labelSpan = document.createElement("span");
    labelSpan.setAttribute("class", `${logItem.label}LabelSpan labelSpan`);
    labelSpan.innerText = getLabel(logItem.label);

    todoSpan = document.createElement("span");
    todoSpan.setAttribute("class", "todoSpan");
    todoSpan.innerText = todo.name;
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
    log.timestamp = getFormattedCurrentDataAndTime();
    log.todoID = todo.id;
    log.label = todo.status;
    return log;
}

//get current date and time and returns it formatted form
function getFormattedCurrentDataAndTime() {
    let currentdate = new Date();
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
    let timestamp = year + "." + month + "." + day + " " + hour + ":" + minute;
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
//----------------------------------------------------------
//----------------------------------------------------------
//----------------------------------------------------------
//----------------------------------------------------------

showNewTodoAlert(false);
loadData();
loadLogDB();

//logViewButton
document.querySelector("#option1").onclick = function () {
    if (this.checked) {
        toggleButtons(this,document.querySelector("#option2"));
        let logContainer=document.querySelector("#logContainer");
        let dailyContainer=document.querySelector("#dailyContainer");
        togglePanels(dailyContainer, logContainer);
    }
};

//dailyViewButton
document.querySelector("#option2").onclick = function () {
    if (this.checked) {
        toggleButtons(this,document.querySelector("#option1"));
        let logContainer=document.querySelector("#logContainer");
        let dailyContainer=document.querySelector("#dailyContainer");
        togglePanels(logContainer, dailyContainer);
        dailyContainer.scrollTo(0, dailyContainer.scrollHeight);
    }
};

function toggleButtons(button1, button2){
    button2.checked = false;
    button2.parentElement.setAttribute("class", "btn btn-light");
    button1.checked = true;
    button1.parentElement.setAttribute("class", "btn btn-light active");
}
function togglePanels(panel1, panel2){
    panel1.style.display = 'none';
    panel2.style.display = 'block';
}