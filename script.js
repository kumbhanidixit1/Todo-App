const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const count = document.getElementById("task-count");
const empty = document.getElementById("empty-state");
const clearButton = document.getElementById("clear-completed");

const STORAGE_KEY = "inkdesk-tasks-v1";
let tasks = [];
let filter = "all";

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  tasks = Array.isArray(saved) ? saved : [];
} catch {
  tasks = [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function visibleTasks() {
  if (filter === "active") return tasks.filter((t) => !t.completed);
  if (filter === "completed") return tasks.filter((t) => t.completed);
  return tasks;
}

function renderTasks() {
  list.replaceChildren();
  const shown = visibleTasks();
  empty.hidden = shown.length !== 0;

  shown.forEach((task) => {
    const li = document.createElement("li");
    li.classList.toggle("completed", task.completed);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.text}`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const span = document.createElement("span");
    span.textContent = task.text;
    span.title = "Double-click to edit";
    span.addEventListener("dblclick", () => startEdit(task, span));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    li.append(checkbox, span, deleteButton);
    list.appendChild(li);
  });

  const remaining = tasks.filter((task) => !task.completed).length;
  count.textContent = `${remaining} task${remaining !== 1 ? "s" : ""} remaining`;
}

function startEdit(task, span) {
  const field = document.createElement("input");
  field.className = "edit-input";
  field.type = "text";
  field.value = task.text;
  field.maxLength = 120;
  span.replaceWith(field);
  field.focus();
  field.select();

  const commit = () => {
    const next = field.value.trim();
    if (next) task.text = next;
    saveTasks();
    renderTasks();
  };

  field.addEventListener("blur", commit);
  field.addEventListener("keydown", (e) => {
    if (e.key === "Enter") field.blur();
    if (e.key === "Escape") renderTasks();
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    text,
    completed: false,
  });

  saveTasks();
  renderTasks();
  input.value = "";
  input.focus();
});

document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    document.querySelectorAll(".filter").forEach((b) => b.classList.toggle("active", b === btn));
    renderTasks();
  });
});

clearButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
