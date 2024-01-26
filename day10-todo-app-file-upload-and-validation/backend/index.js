const express = require("express");
const cors = require("cors");
const multer = require("multer");
const logger = require("morgan");
const { body, validationResult } = require("express-validator");
const { readJsonFile, writeJsonFile, removeFile } = require("./fsUtils");
const { addTodoSchema } = require("./validations");

const app = express();

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERROR = 500;

app.use(cors()); // erlaubt den Ürsprungsübergreifenden (Ursprung=Origin, übergreifend=Cross) Zugriff auf resourcen (also das ein Client von zb localhost:3489 auf localhost:5909, oder sonst eine anderen Server greifen kann)
app.use(logger("dev"));
// app.use((req, _, next) => {
//   console.log("new request", req.method, req.url);
//   next();
// });

// enable download of file in the upload folder
app.use(express.static("uploads")); // GET /api/todos -> next() .... GET /00359dece76697d48b33e4b0ae332e0c -> res.sendFile()

app.use(express.json()); // parse body of all incoming requests

// CRUD - Create, Read (All, One), Update, Delete
app.get("/api/todos", (_, res) => {
  readJsonFile("./todos-data.json")
    .then((todos) => res.status(OK).json({ success: true, result: todos })) // put 200 (OK) into status and the object as JSON in the body...(and end the response)
    .catch((err) => {
      console.log(err); // wir geben den error aus damit wir sehen, was passiert ist (nur für uns)
      res
        .status(INTERNAL_SERVER_ERROR)
        .json({ success: false, error: "Failed to load todos" });
    });
});
const attachmentStorage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (_, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/*
Validation constraints:
POST /api/todos
    task constraints
        * string
        * trimed
        * length > 0 && length < 1000
        * contains at least 3 letter
    "______@asjkns.com"
    kontakt -> email
        * string
        * match this regex : ./...
        * string vor dem @ zeichen
        * @ Zeichen
        * domain nach dem @zeichen
        * .tld
    
*/
function isInvalidTask(task) {
  const invalid =
    !task ||
    typeof task !== "string" ||
    task.trim().length === 0 ||
    task.trim().length > 1000;

  return invalid;
}

const uploadMiddleware = multer({ storage: attachmentStorage });
app.post("/api/todos", uploadMiddleware.single("attachment"), (req, res) => {
  const { value: todoInfo, error } = addTodoSchema.validate(req.body);
  if (error) {
    // there are errors
    res.status(BAD_REQUEST).json({
      success: false,
      error: "Invalid todo task",
      errorInfo: error,
    });
    return;
  }

  // body wurde auf Zeile 15 app.use(express.json()) bereits geparsed, dh ich kann sofort auf req.body als objekt zugreifen
  const newTodoTask = todoInfo.task; // "task" ist definiert worden im diagramm
  const newTodo = {
    id: Date.now(),
    task: newTodoTask,
    done: false,
    // attachment: req.file ? req.file.filename : "", // weiterer ansatz
    contact: todoInfo.contact,
    tags: todoInfo.tags,
    link: todoInfo.link,
  };

  if (req.file) {
    newTodo.attachment = req.file.filename;
  }

  readJsonFile("./todos-data.json")
    .then((todos) => [newTodo, ...todos])
    .then((newTodosArray) => writeJsonFile("./todos-data.json", newTodosArray))
    .then((newTodosArray) => {
      // console.log(newTodosArray);
      res.status(CREATED).json({ success: true, result: newTodosArray });
    })
    .catch((err) => {
      console.log(err); // wir geben den error aus damit wir sehen, was passiert ist (nur für uns)
      res
        .status(INTERNAL_SERVER_ERROR)
        .json({ success: false, error: "Failed to update todo" });
    });
});

app.patch("/api/todos/:todoId/toggleDone", (req, res) => {
  const todoId = req.params.todoId; // id: 380
  readJsonFile("./todos-data.json")
    .then((todos) => {
      // [{...}, ..., { id: 380, task: "...", done: false }, {...} ]
      const updatedTodos = todos.map((todo) => {
        if (todo.id.toString() === todoId) {
          // return { id: todo.id, task: todo.task, done: !todo.done }; // equivallent zur unteren zeile
          return { ...todo, done: !todo.done }; // updated todo object
        } else {
          // Gargabe In, Garbage Out
          return todo;
        }
      });
      return updatedTodos;
    })
    .then((newTodosArray) => writeJsonFile("./todos-data.json", newTodosArray))
    .then((newTodosArray) => {
      // console.log(newTodosArray);
      res.status(OK).json({ success: true, result: newTodosArray });
    })
    .catch((err) => {
      console.log(err); // wir geben den error aus damit wir sehen, was passiert ist (nur für uns)
      res
        .status(INTERNAL_SERVER_ERROR)
        .json({ success: false, error: "Failed to add new todo" });
    });
});

app.delete("/api/todos/:todoId", (req, res) => {
  const todoId = req.params.todoId; // id zb 380
  readJsonFile("./todos-data.json")
    .then((todos) => {
      const foundTodo = todos.find((todo) => todo.id.toString() === todoId);
      if (foundTodo && foundTodo.attachment) {
        removeFile("./uploads/" + foundTodo.attachment).catch((err) => {
          console.log(err); // add "internal" error handling here (logserver)
        }); // remove in background
      }
      // [{...}, ..., { id: 380, task: "...", done: false }, {...} ]
      const todosWithoutDeletedTodo = todos.filter(
        (todo) => todo.id.toString() !== todoId // lass alle todos über die NICHT die gegebene todoId haben (aka -> lösche das todo mit der gegebenen todoId)
      );
      return todosWithoutDeletedTodo;
    })
    .then((newTodosArray) => writeJsonFile("./todos-data.json", newTodosArray))
    .then((newTodosArray) => {
      // console.log(newTodosArray);
      res.status(OK).json({ success: true, result: newTodosArray });
    })
    .catch((err) => {
      console.log(err); // wir geben den error aus damit wir sehen, was passiert ist (nur für uns)
      res
        .status(INTERNAL_SERVER_ERROR)
        .json({ success: false, error: "Failed to remove todo" });
    });
});

// endpoint not found handler
app.use((_, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
