const express = require("express");
const multer = require("multer");

// const uploadMiddleware = multer(); // optional { dest: path } wenn man will, dass die datei sofort gespeichert wird!
const uploadMiddlewareWithDest = multer({ dest: "./uploads" }); // optional { dest: path } wenn man will, dass die datei sofort gespeichert wird!

const app = express();

app.use((req, _, next) => {
  console.log("new request", req.method, req.url);
  next();
});
app.use(express.json()); // parse body of all incoming requests
// app.use(uploadMiddleware.single("profileImg")); // parse body of all Content-Type: multipart/form-data
// app.use(uploadMiddleware.single("pdfAttachment")); // parse body of all Content-Type: multipart/form-data

app.post(
  "/api/users/profile",
  //   uploadMiddleware.single("profileImg"), // parse the multipart/form-data body and add body field
  uploadMiddlewareWithDest.single("profileImg"), // parse the multipart/form-data body and add body field
  (req, res) => {
    console.log(req.body);
    console.log(req.file);
    res.status(200).json({});
  }
);

// endpoint not found handler
app.use((_, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = 5050;
app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
