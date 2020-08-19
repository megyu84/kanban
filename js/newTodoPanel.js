function addNewTodo(todoStatus) {
    //todoStatus can be 'todo' or 'saved', it depends on the pushed button
    let newTodo = document.querySelector("#newTodoInput");
    let iconImg = document.querySelector("#selectedTodoIcon");


    let isExist = checkingNewTodoExist(newTodo.value);
    if (newTodo.value.trim() == "") {
        isExist = true;
        showNewTodoAlert(isExist, "Nem adtál meg teendőt!", "yellow");
    } else {
        if (!isExist) {
            let todo;
            if (iconImg) {
                todo = { name: newTodo.value, status: todoStatus, icon: iconImg.getAttribute("alt") };
                //console.log(todo);
            } else {
                todo = { name: newTodo.value, status: todoStatus };
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
                    //console.log(json);
                    newTodo.value = "";
                    loadData();
                    todo.id = json.id;
                    showNewTodoAlert(true, `${todo.name} hozzáadva`, "zöld");
                    addNewLogItem(todo);
                });
        } else {
            showNewTodoAlert(isExist, "Ez a todo már létezik.", "red");
            showExistingTodo(newTodo.value);
        }
    }
    document.querySelector("#todoIconDiv").innerHTML = "";
}
//check if the new todo is unique
function checkingNewTodoExist(newtodo) {
    let allTodos = todos.concat(proceedTodos, finishedTodos, savedTodos);
    let existTodo = allTodos.some(todo => todo.name == newtodo);
    return existTodo;
}

function showNewTodoAlert(showAlert, message, type) {
    let newTodoAlert = document.querySelector("#newTodoAlert");
    switch (type) {
        case "red":
            newTodoAlert.setAttribute("class", "alert alert-danger");
            break;
        case "yellow":
            newTodoAlert.setAttribute("class", "alert alert-warning");
            break;
        default:
            newTodoAlert.setAttribute("class", "alert alert-success");
    }
    if (showAlert) {
        newTodoAlert.innerText = message;
        newTodoAlert.style.visibility = "visible";
        setTimeout(function () { newTodoAlert.style.visibility = "hidden"; }, 2000);
    } else {
        newTodoAlert.style.visibility = "hidden";
    }
}

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