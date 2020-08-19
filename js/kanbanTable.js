// upload table with todo data 
function uploadTable() {
    let todoTable = document.querySelector("#todoTable tbody");
    todoTable.innerHTML = "";
    let maxArrayLength = setMaxElement();
    initTodoArrays(maxArrayLength);
    for (let i = 0; i < maxArrayLength; i++) {
        todoTable.appendChild(createTodoRow([todos[i], proceedTodos[i], finishedTodos[i]]));
    }
}

//define the longest array from todos, proceedTodos and finishedTodos
function setMaxElement() {
    let max = todos.length;
    if (max < proceedTodos.length) {
        max = proceedTodos.length;
    }
    if (max < finishedTodos.length) {
        max = finishedTodos.length;
    }
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

//create td elements and fill the kanban table
function createTodoRow(todos) {
    let tr = document.createElement("tr");
    for (let todo of todos) {
        let td = document.createElement("td");
        if (typeof todo.name == 'undefined') {
            td.innerText = "";
        } else {
            if ('icon' in todo) {
                // console.log(todo, "This todo has an icon");
                td.innerHTML = `<img class="todoIcon" src="/icon/${todo.icon}.png" width=30px alt="${todo.icon}">${todo.name}`;
            } else {
                td.innerHTML = todo.name;
            }
            td.style.cursor = "pointer";
            td.setAttribute("name", todo.name);
            td.setAttribute("class", "todoTD");
            td.addEventListener("click", function (event) {
                moveToProceed(todo);
            });
            // td.addEventListener("mouseout", function (event) {
            // });
            td.addEventListener("mouseover", function (event) {
                td.style.backgroundColor = "rgba(100,255,100,0.7)";
            });
            td.addEventListener("mouseout", function (event) {
                // td.style.backgroundColor = "rgba(255,255,255,0.7)";
                td.style.backgroundColor = "transparent";
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
            tr.childNodes[2].style.backgroundColor = "rgba(255,100,100,0.7)";

        });
        buttonTd.addEventListener("mouseout", function (event) {
            tr.childNodes[2].style.backgroundColor = "transparent";
            tr.childNodes[2].style.textDecoration = "initial";
            tr.childNodes[2].style.color = "black";
        });
    } else {
        buttonTd.innerText = "";
    }
    tr.appendChild(buttonTd);
    return tr;
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