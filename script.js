// ==================== SELEKTORY ====================
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const darkModeToggle = document.getElementById("darkModeToggle");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filterBtns = document.querySelectorAll(".filter-btn");
const statTotal = document.getElementById("statTotal");
const statActive = document.getElementById("statActive");
const statDone = document.getElementById("statDone");
const markAllBtn = document.getElementById("markAllBtn");
const clearDoneBtn = document.getElementById("clearDoneBtn");
const editModal = document.getElementById("editModal");
const closeModal = document.getElementById("closeModal");
const cancelEdit = document.getElementById("cancelEdit");
const saveEdit = document.getElementById("saveEdit");
const editTaskInput = document.getElementById("editTaskInput");
const editPrioritySelect = document.getElementById("editPrioritySelect");
const taskDate = document.getElementById("taskDate");
const toastElement = document.getElementById("toast");

// ==================== APP STATE ====================
let tasks = [];
let currentFilter = "all"; // all, active, done
let currentSort = "newest"; // newest, oldest, priority, completed-last
let searchQuery = "";
let editingTaskId = null;

// ==================== INICIALIZACE ====================
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  loadDarkMode();
  render();
  setupEventListeners();
});

// ==================== EVENT LISTENERY ====================
function setupEventListeners() {
  // Přidávání úkolů
  addTaskBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });

  // Dark mode
  darkModeToggle.addEventListener("click", toggleDarkMode);

  // Filtrování
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      updateFilterButtons();
      render();
    });
  });

  // Třídění
  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    render();
  });

  // Vyhledávání
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    render();
  });

  // Hromadné akce
  markAllBtn.addEventListener("click", markAllAsCompleted);
  clearDoneBtn.addEventListener("click", clearDoneTasks);

  // Modal
  closeModal.addEventListener("click", closeEditModal);
  cancelEdit.addEventListener("click", closeEditModal);
  saveEdit.addEventListener("click", saveEditedTask);
  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) closeEditModal();
  });
  editTaskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveEditedTask();
  });
}

// ==================== CORE FUNCTIONS ====================

// Přidání úkolu
function addTask() {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (!text) {
    showToast("Zadej text úkolu", "error");
    taskInput.focus();
    return;
  }

  if (text.length > 200) {
    showToast("Úkol je příliš dlouhý (max. 200 znaků)", "error");
    return;
  }

  const task = {
    id: Date.now(),
    text: text,
    priority: priority,
    done: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(task);
  saveTasks();
  taskInput.value = "";
  prioritySelect.value = "medium";
  taskInput.focus();

  showToast("Úkol přidán ✓", "success");
  render();
}

// Smazání úkolu
function deleteTask(id) {
  const taskElement = document.querySelector(`[data-id="${id}"]`);
  if (taskElement) {
    taskElement.classList.add("removing");
  }

  setTimeout(() => {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    render();
    showToast("Úkol smazán", "info");
  }, 300);
}

// Přepnutí stavu úkolu
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    render();
  }
}

// Otevření modal pro editaci
function openEditModal(id) {
  editingTaskId = id;
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  editTaskInput.value = task.text;
  editPrioritySelect.value = task.priority;

  const date = new Date(task.createdAt);
  const formattedDate = date.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  taskDate.textContent = `Vytvořeno: ${formattedDate}`;

  editModal.classList.remove("hidden");
  editTaskInput.focus();
}

// Zavření modal
function closeEditModal() {
  editModal.classList.add("hidden");
  editingTaskId = null;
  editTaskInput.value = "";
}

// Uložení editace
function saveEditedTask() {
  if (!editingTaskId) return;

  const text = editTaskInput.value.trim();
  const priority = editPrioritySelect.value;

  if (!text) {
    showToast("Úkol nesmí být prázdný", "error");
    return;
  }

  if (text.length > 200) {
    showToast("Úkol je příliš dlouhý (max. 200 znaků)", "error");
    return;
  }

  const task = tasks.find((t) => t.id === editingTaskId);
  if (task) {
    task.text = text;
    task.priority = priority;
    saveTasks();
    closeEditModal();
    render();
    showToast("Úkol upraven ✓", "success");
  }
}

// Označit vše jako hotové
function markAllAsCompleted() {
  if (tasks.length === 0) {
    showToast("Žádné úkoly k označení", "info");
    return;
  }

  const activeTasks = tasks.filter((t) => !t.done);
  if (activeTasks.length === 0) {
    showToast("Všechny úkoly jsou již hotové", "info");
    return;
  }

  activeTasks.forEach((task) => {
    task.done = true;
  });

  saveTasks();
  render();
  showToast(`${activeTasks.length} úkolů označeno jako hotové ✓`, "success");
}

// Smazání hotových úkolů
function clearDoneTasks() {
  const doneTasks = tasks.filter((t) => t.done);

  if (doneTasks.length === 0) {
    showToast("Žádné hotové úkoly k smazání", "info");
    return;
  }

  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
  showToast(`${doneTasks.length} hotových úkolů smazáno`, "success");
}

// Přepínání dark mode
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("focuslist_darkMode", isDark);
}

// Nastavení dark mode při startu
function loadDarkMode() {
  const isDark = localStorage.getItem("focuslist_darkMode") === "true";
  if (isDark) {
    document.body.classList.add("dark-mode");
  }
}

// ==================== FILTROVÁNÍ ====================

function updateFilterButtons() {
  filterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });
}

function getFilteredAndSearchedTasks() {
  let filtered = tasks;

  // Filtrování podle stavu
  switch (currentFilter) {
    case "active":
      filtered = filtered.filter((t) => !t.done);
      break;
    case "done":
      filtered = filtered.filter((t) => t.done);
      break;
  }

  // Vyhledávání
  if (searchQuery) {
    filtered = filtered.filter((t) =>
      t.text.toLowerCase().includes(searchQuery)
    );
  }

  return filtered;
}

// ==================== TŘÍDĚNÍ ====================

function sortTasks(tasksToSort) {
  const sorted = [...tasksToSort];

  switch (currentSort) {
    case "newest":
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case "oldest":
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case "priority":
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      sorted.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      break;
    case "completed-last":
      sorted.sort((a, b) => (a.done ? 1 : -1) - (b.done ? 1 : -1));
      break;
  }

  return sorted;
}

// ==================== RENDERING ====================

function render() {
  const filteredTasks = getFilteredAndSearchedTasks();
  const sortedTasks = sortTasks(filteredTasks);

  taskList.innerHTML = "";

  updateFilterCounts();
  updateStats();

  if (sortedTasks.length === 0) {
    renderEmptyState();
    return;
  }

  sortedTasks.forEach((task) => {
    const li = createTaskElement(task);
    taskList.appendChild(li);
  });
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = `task-item ${task.done ? "done" : ""} ${
    task.priority === "high" && !task.done ? "high-priority" : ""
  }`;
  li.dataset.id = task.id;

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => toggleTask(task.id));

  // Priority badge
  const priorityBadge = document.createElement("div");
  priorityBadge.className = `priority-badge ${task.priority}`;
  priorityBadge.title = `Priorita: ${task.priority}`;

  // Task content
  const content = document.createElement("div");
  content.className = "task-content";

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const date = new Date(task.createdAt);
  const formattedDate = date.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
  });
  const formattedTime = date.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateSpan = document.createElement("span");
  dateSpan.className = "task-date";
  dateSpan.innerHTML = `<i class="fas fa-calendar"></i> ${formattedDate} ${formattedTime}`;

  const priorityLabel = document.createElement("span");
  const priorityText = {
    high: "Vysoká",
    medium: "Normální",
    low: "Nízká",
  };
  priorityLabel.textContent = `${priorityText[task.priority]} priorita`;

  meta.appendChild(dateSpan);
  meta.appendChild(priorityLabel);

  content.appendChild(text);
  content.appendChild(meta);

  // Actions
  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.innerHTML = '<i class="fas fa-edit"></i>';
  editBtn.title = "Upravit úkol";
  editBtn.addEventListener("click", () => openEditModal(task.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.title = "Smazat úkol";
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(priorityBadge);
  li.appendChild(content);
  li.appendChild(actions);

  return li;
}

function renderEmptyState() {
  const li = document.createElement("li");
  li.className = "empty-state";

  let message = "";
  let icon = "";

  if (searchQuery) {
    message = "Žádné úkoly se neshodují s hledáním";
    icon = "fa-search";
  } else if (currentFilter === "done") {
    message = "Žádné hotové úkoly";
    icon = "fa-check-circle";
  } else if (currentFilter === "active") {
    message = "Všechny úkoly jsou hotové! 🎉";
    icon = "fa-party-horn";
  } else {
    message = "Zatím žádné úkoly. Vytvoř si nějaký!";
    icon = "fa-inbox";
  }

  li.innerHTML = `<i class="fas ${icon}"></i>\n<p>${message}</p>`;
  taskList.appendChild(li);
}

// ==================== STATISTIKY ====================

function updateStats() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const active = total - done;

  statTotal.textContent = total;
  statActive.textContent = active;
  statDone.textContent = done;
}

function updateFilterCounts() {
  const allCount = tasks.length;
  const activeCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;

  filterBtns.forEach((btn) => {
    const filter = btn.dataset.filter;
    const countEl = btn.querySelector(".count");
    if (countEl) {
      if (filter === "all") {
        countEl.textContent = allCount;
      } else if (filter === "active") {
        countEl.textContent = activeCount;
      } else if (filter === "done") {
        countEl.textContent = doneCount;
      }
    }
  });
}

// ==================== STORAGE ====================

function saveTasks() {
  localStorage.setItem("focuslist_tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const stored = localStorage.getItem("focuslist_tasks");
  try {
    tasks = stored ? JSON.parse(stored) : [];
    // Validace dat
    if (!Array.isArray(tasks)) {
      tasks = [];
    }
  } catch (e) {
    console.error("Chyba při načítání úkolů:", e);
    tasks = [];
  }
}

// ==================== NOTIFIKACE ====================

function showToast(message, type = "info") {
  toastElement.textContent = message;
  toastElement.className = `toast show ${type}`;

  setTimeout(() => {
    toastElement.classList.remove("show");
  }, 3000);
}

// ==================== UTILITY ====================

// Export pro debugging
window.debugApp = {
  getTasks: () => tasks,
  getCurrentFilter: () => currentFilter,
  getCurrentSort: () => currentSort,
  clearAllData: () => {
    if (confirm("Opravdu chceš smazat všechny úkoly?")) {
      tasks = [];
      saveTasks();
      render();
      showToast("Všechna data smazána", "info");
    }
  },
};

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + N: Nový úkol
  if ((e.ctrlKey || e.metaKey) && e.key === "n") {
    e.preventDefault();
    taskInput.focus();
  }
  // Ctrl/Cmd + K: Vyhledávání
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    searchInput.focus();
  }
  // Escape: Zavřít modal
  if (e.key === "Escape" && !editModal.classList.contains("hidden")) {
    closeEditModal();
  }
});
