"use strict";
// ---------- State ----------
let todos = [];
let currentFilter = "all";
let nextId = 1;
// ---------- DOM helper (throws early if an id is missing) ----------
function $(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element #${id} not found`);
    return el;
}
const form = $("todo-form");
const input = $("todo-input");
const list = $("todo-list");
const countEl = $("items-left");
const clearCompletedBtn = $("clear-completed");
const clearAllBtn = $("clear-all");
const filterButtons = document.querySelectorAll(".filter");
// ---------- Actions ----------
function addTodo(text) {
    const trimmed = text.trim();
    if (trimmed === "")
        return;
    todos = [...todos, { id: nextId++, text: trimmed, completed: false }];
    render();
}
function toggleTodo(id) {
    todos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    render();
}
function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    render();
}
function editTodo(id, newText) {
    const trimmed = newText.trim();
    if (trimmed === "") {
        deleteTodo(id); // empty edit removes the todo
        return;
    }
    todos = todos.map((t) => (t.id === id ? { ...t, text: trimmed } : t));
    render();
}
function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    render();
}
function clearAll() {
    todos = [];
    render();
}
function setFilter(filter) {
    currentFilter = filter;
    render();
}
function getVisibleTodos() {
    switch (currentFilter) {
        case "active":
            return todos.filter((t) => !t.completed);
        case "completed":
            return todos.filter((t) => t.completed);
        default:
            return todos;
    }
}
// ---------- Inline editing (double-click) ----------
function startEditing(li, todo) {
    const label = li.querySelector(".todo-text");
    if (!label)
        return;
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "edit-input";
    editInput.value = todo.text;
    label.replaceWith(editInput);
    editInput.focus();
    editInput.select();
    let finished = false;
    const save = () => {
        if (finished)
            return;
        finished = true;
        editTodo(todo.id, editInput.value);
    };
    const cancel = () => {
        if (finished)
            return;
        finished = true;
        render();
    };
    editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter")
            save();
        if (e.key === "Escape")
            cancel();
    });
    editInput.addEventListener("blur", save);
}
// ---------- Render ----------
function render() {
    list.innerHTML = "";
    const visible = getVisibleTodos();
    if (visible.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty";
        empty.textContent =
            todos.length === 0 ? "Nothing here yet. Add your first todo." : `No ${currentFilter} todos.`;
        list.appendChild(empty);
    }
    visible.forEach((todo) => {
        const li = document.createElement("li");
        li.className = "todo-item" + (todo.completed ? " completed" : "");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "toggle";
        checkbox.checked = todo.completed;
        checkbox.setAttribute("aria-label", `Mark "${todo.text}" as done`);
        checkbox.addEventListener("change", () => toggleTodo(todo.id));
        const label = document.createElement("span");
        label.className = "todo-text";
        label.textContent = todo.text; // textContent, not innerHTML -> no XSS
        label.addEventListener("dblclick", () => startEditing(li, todo));
        const del = document.createElement("button");
        del.type = "button";
        del.className = "delete";
        del.textContent = "🗑";
        del.setAttribute("aria-label", `Delete "${todo.text}"`);
        del.addEventListener("click", () => deleteTodo(todo.id));
        li.append(checkbox, label, del);
        list.appendChild(li);
    });
    // items left
    const left = todos.filter((t) => !t.completed).length;
    countEl.textContent = `${left} ${left === 1 ? "item" : "items"} left`;
    // active filter button
    filterButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.filter === currentFilter);
    });
}
// ---------- Events ----------
form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = "";
    input.focus();
});
filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});
clearCompletedBtn.addEventListener("click", clearCompleted);
clearAllBtn.addEventListener("click", clearAll);
// ---------- Start ----------
render();