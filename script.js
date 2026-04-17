const input = document.getElementById("taskInput");
const button = document.getElementById("addTaskBtn");
const list = document.getElementById("taskList");
const counter = document.getElementById("counter");
const darkBtn = document.getElementById("darkModeToggle");

button.addEventListener("click", addTask);
darkBtn.addEventListener("click", toggleDarkMode);

loadTasks();

function updateCounter(){
    counter.textContent = "Počet úkolů: " + list.children.length;
}

function saveTasks(){

    const tasks = [];

    document.querySelectorAll("#taskList li span").forEach(span => {
        tasks.push({
            text: span.textContent,
            done: span.classList.contains("done")
        });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks(){

    const data = localStorage.getItem("tasks");

    if(!data) return;

    const tasks = JSON.parse(data);

    tasks.forEach(task => {

        const li = document.createElement("li");

        const span = document.createElement("span");
        span.textContent = task.text;

        if(task.done){
            span.classList.add("done");
        }

        span.addEventListener("click", function(){
            span.classList.toggle("done");
            saveTasks();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";

        deleteBtn.addEventListener("click", function(){
            li.remove();
            saveTasks();
            updateCounter();
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);

        list.appendChild(li);

    });

    updateCounter();
}

function addTask(){

    const text = input.value;

    if(text === "") return;

    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = text;

    span.addEventListener("click", function(){
        span.classList.toggle("done");
        saveTasks();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";

    deleteBtn.addEventListener("click", function(){
        li.remove();
        saveTasks();
        updateCounter();
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);

    list.appendChild(li);

    input.value = "";

    saveTasks();
    updateCounter();
}

function toggleDarkMode(){

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );
}

if(localStorage.getItem("darkMode") === "true"){
    document.body.classList.add("dark");
}