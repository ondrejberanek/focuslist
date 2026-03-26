const input = document.getElementById("taskInput");
const button = document.getElementById("addTaskBtn");
const list = document.getElementById("taskList");
const counter = document.getElementById("counter");
const darkBtn = document.getElementById("darkModeToggle");

button.addEventListener("click", addTask);
darkBtn.addEventListener("click", toggleDarkMode);

function updateCounter(){
    counter.textContent = "Počet úkolů: " + list.children.length;
}

function addTask(){

    const text = input.value;

    if(text === "") return;

    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = text;

    span.addEventListener("click", function(){
        span.classList.toggle("done");
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";

    deleteBtn.addEventListener("click", function(){
        li.remove();
        updateCounter();
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);

    list.appendChild(li);

    input.value = "";

    updateCounter();
}

function toggleDarkMode(){
    document.body.classList.toggle("dark");
}