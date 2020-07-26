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
        }else{
            removedTodos.push(todoListFromServer[i]);
        }
    }
    uploadTable();
    uploadSavedTodos();
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
    span.innerText = todo.name;
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
        .then(resp => loadData());

}
function createTodoRow(todos) {
    let tr = document.createElement("tr");
    for (let todo of todos) {
        let td = document.createElement("td");
        if (typeof todo.name == 'undefined') {
            td.innerText = "";
        } else {
            td.style.cursor = "pointer";
            td.innerText = todo.name;
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
    let isExist = checkingNewTodoExist(newTodo.value);
    if (newTodo.value.trim() == "") {
        isExist = true;
        showNewTodoAlert(isExist, "Nincs használható tartalom.");
        console.log("Üres todo");
    }
    if (!isExist) {
        let fetchOptions = {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ name: newTodo.value, status: "todo" })
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
            });
    } else {
        showNewTodoAlert(isExist, "Ez a todo már létezik.");
        showExistingTodo(newTodo.value);
    }
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

function loadLogDB(){
    let fetchInit = {
        method: "GET",
        headers: new Headers(),
        mode: "cors",
        cache: "default"
    };
    const fetchData = fetch("http://localhost:3000/log", fetchInit);
    fetchData.then(data => data.json()).then(data => initLogDiv(data));
}
function initLogDiv(data){
    let logContainer = document.querySelector("#logContainer");
    let allTodos = todos.concat(proceedTodos, finishedTodos, savedTodos, removedTodos);
    for(let logItem of data){
        let todoID = logItem.todoID;
        let todoName = allTodos.find(todo => todo.id == todoID).name;
        console.log("Amit keresünk: ", todoName);
        logContainer.innerText += todoName + "\n";
    }

}
//----------------------------------------------------------
//----------------------------------------------------------
//----------------------------------------------------------
//----------------------------------------------------------

showNewTodoAlert(false);
loadData();
loadLogDB();