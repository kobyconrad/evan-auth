const express = require("express");
const bcrpyt = require("bcrypt");
const nanoid = require("nanoid");
const app = express();
const port = 3000;
app.use(express.json());
// Our fake database
const users = {};
const sessions = {};
app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Hash the password
  const hash = await bcrpyt.hash(password, 10);
  // Save it in our "database"
  users[username] = hash;
  // Create a session token, store in "database"
  const token = nanoid();
  sessions[token] = true;
  // Attach the session token to the cookie
  res.cookie("my-session", token, {
    httpOnly: true,
  });
  res.status(200).send("ok");
});
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!users[username]) {
    return res.status(401).send("unauthorized");
  }
  // Check that the password matches the hash
  const hash = users[username];
  const isGood = await bcrpyt.compare(password, hash);
  if (!isGood) {
    return res.status(401).send("unauthorized");
  }
  // Create a session token, store in "database"
  const token = nanoid();
  sessions[token] = true;
  // Attach the session token to the cookie
  res.cookie("my-session", token, {
    httpOnly: true,
  });
  res.status(200).send("ok");
});
app.get("/my-secret-data", (req, res) => {
  const token = req.cookies["my-session"];
  if (!sessions[token]) {
    res.status(401).send("unauthorized");
  }
  res.status(200).send("SUPER SECRET USER DATA");
});
app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
