import { useEffect, useState } from "react";
import TodoItem from "./TodoItem";
import AddTodoForm from "./AddTodoForm";

const TodoList = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/todos", { method: "GET" })
      .then((res) => res.json())
      .then(({ success, result, error }) => {
        if (!success) console.log(error); // FIXME: add error handling
        else setTodos(result);
      });
  }, []);

  console.log(todos);

  return (
    <>
      <AddTodoForm
        updateTodosArray={(newTodosArray) => setTodos(newTodosArray)}
      />
      {todos.map((todo) => (
        <TodoItem
          todo={todo}
          updateTodosArray={(newTodosArray) => setTodos(newTodosArray)} // es geht auch updateTodosArray={setTodos}
        />
      ))}
    </>
  );
};

export default TodoList;
