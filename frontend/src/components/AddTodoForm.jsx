import { useState } from "react";

const AddTodoForm = ({ updateTodosArray }) => {
  const [task, setTask] = useState("");
  const [attachment, setAttachment] = useState();

  console.log(attachment);

  function addTodo() {
    const formData = new FormData();
    formData.append("task", task); // value ist ein string
    if (attachment) {
      formData.append("attachment", attachment, attachment.name); // value ist ein string
    }

    fetch("http://localhost:3000/api/todos", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then(({ success, result, error }) => {
        if (!success) console.log(error); // FIXME: add error handling
        else updateTodosArray(result);
        setTask(""); // reset content of task input
      });
  }
  return (
    <div className="add-new-todo-wrapper">
      <input
        className="add-new-todo-input"
        type="text"
        placeholder="Add new todo"
        value={task}
        onChange={(event) => setTask(event.target.value)}
      />
      <input
        type="file"
        onChange={(event) => setAttachment(event.target.files[0])}
      />
      <button className="add-new-todo-button" onClick={addTodo}>
        Add
      </button>
    </div>
  );
};

export default AddTodoForm;
