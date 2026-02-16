const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const db = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../client")));

/* Create Poll */
app.post("/create", (req, res) => {
  const { questions } = req.body;

  if (!questions || questions.length === 0) {
    return res.status(400).json({ error: "No questions provided" });
  }

  const pollId = uuidv4();
  db.run("INSERT INTO polls (id) VALUES (?)", [pollId]);

  questions.forEach(q => {
    db.run(
      "INSERT INTO questions (poll_id, question) VALUES (?, ?)",
      [pollId, q.question],
      function () {
        const qId = this.lastID;

        q.options.forEach(opt => {
          db.run(
            "INSERT INTO options (question_id, text) VALUES (?, ?)",
            [qId, opt]
          );
        });
      }
    );
  });

  const host = req.headers.host;

  res.json({
    link: `http://${host}/vote.html?id=${pollId}`
  });
});

/* Get Poll */
app.get("/poll/:id", (req, res) => {
  const pollId = req.params.id;

  db.all("SELECT * FROM questions WHERE poll_id=?", [pollId], (err, questions) => {
    if (!questions.length) return res.status(404).json({ error: "Not found" });

    let result = [];
    let done = 0;

    questions.forEach(q => {
      db.all("SELECT * FROM options WHERE question_id=?", [q.id], (err, opts) => {
        result.push({ question: q.question, options: opts });
        done++;
        if (done === questions.length) res.json(result);
      });
    });
  });
});

/* Vote */
app.post("/vote", (req, res) => {
  const { optionId, pollId } = req.body;

  db.run("UPDATE options SET votes = votes + 1 WHERE id=?", [optionId], () => {
    io.to(pollId).emit("update");
    res.sendStatus(200);
  });
});

/* Socket */
io.on("connection", socket => {
  socket.on("join", pollId => socket.join(pollId));
});

server.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
