// upload the saved todos
function uploadSavedTodos() {
    let savedDiv = document.querySelector("#savedDiv");
    savedDiv.innerHTML = "";
    // console.log("saved:", savedTodos);
    for (savedTodo of savedTodos) {
        //it contains the span and the delete button
        let spanContainer = document.createElement("span");
        spanContainer.setAttribute("class", "spanContainerForSavedTodo");
        let span = document.createElement("span");
        setupSpanElement(span, savedTodo);
        let deleteSpan = document.createElement("span");
        setupDeleteElement(deleteSpan, savedTodo);
        spanContainer.appendChild(span);
        spanContainer.appendChild(deleteSpan);
        savedDiv.appendChild(spanContainer);
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
    span.addEventListener("mouseover", function(event){
        let container = this.parentElement;
        container.style.backgroundColor = "rgba(100,255,100,0.7)";
    });
    span.addEventListener("mouseout", function(event){
        let container = this.parentElement;
        container.style.backgroundColor = "rgba(255,255,255,0.7)";
    });
}
//setup delete element for saved todos
function setupDeleteElement(deleteElement, todo) {
    let deleteIcon = document.createElement("icon");
    deleteIcon.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
    deleteElement.appendChild(deleteIcon);
    deleteElement.setAttribute("type", "button");
    deleteElement.setAttribute("class", "deleteSavedTodoButton");
    deleteElement.addEventListener("click", function (event) {
        removeTodo(todo);
    });
    deleteElement.addEventListener("mouseover", function(event){
        let container = this.parentElement;
        container.style.backgroundColor = "rgba(255,100,100,0.7)";
    });
    deleteElement.addEventListener("mouseout", function(event){
        let container = this.parentElement;
        container.style.backgroundColor = "rgba(255,255,255,0.7)";
    });
}