const TodoItem = ({ todo, updateTodosArray }) => {
  function toggleDone() {
    fetch(`http://localhost:3000/api/todos/${todo.id}/toggleDone`, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then(({ success, result, error }) => {
        if (!success) console.log(error); // FIXME: add error handling
        else updateTodosArray(result);
      });
  }
  function deleteTodo() {
    fetch(`http://localhost:3000/api/todos/${todo.id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(({ success, result, error }) => {
        if (!success) console.log(error); // FIXME: add error handling
        else updateTodosArray(result);
      });
  }
  return (
    <div className="todo-item-wrapper">
      {todo.attachment && (
        <a
          // download="myfile.txt"
          href={"http://localhost:3000/" + todo.attachment}
        >
          📎
        </a>
      )}

      {/* 
      // FALLS die Datei ausschließlich ein Bild ist, kann man dan den Pfad auch als img src verwenden
      <img
        src={"http://localhost:3000/" + todo.attachment}
        alt="bild attachment"
      /> */}
      <p
        className={
          todo.done ? "todo-item-task todo-item-done" : "todo-item-task"
        }
        onClick={toggleDone}
      >
        {todo.task}
      </p>
      <span className="todo-item-delete" onClick={deleteTodo}>
        🗑️
      </span>
    </div>
  );
};

export default TodoItem;
