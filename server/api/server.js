require("dotenv").config();

/*
Server Set-Up
*/

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 3001;
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Pool } = require("pg");
const pool = new Pool({
  user: "admin",
  host: "database",
  database: "crud-test",
  password: "admin",
  port: 5432,
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());
app.options("*", cors());
pool.on("error", (err, client) => {
  console.error("Error:", err);
});

/*
Endpoints
*/

// GET
app.get("/", (req, res) => {
  res.send("Hello, this is the home page.");
});

// POST | INSERT
app.post("/users", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    pool.query(
      "INSERT INTO Users (First_Name, Last_Name, Username, Password) VALUES ($1, $2, $3, $4)",
      [
        req.body.first_name,
        req.body.last_name,
        req.body.username,
        hashedPassword,
      ],
      (error, results) => {
        if (error) {
          console.error(error.stack);
          res.status(400).send();
        }
        res.status(200).json(results.rows);
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send();
  }
});

// GET | SELECT
app.get("/users", authenticateToken, (req, res) => {
  if (req.user.username == "Admin") {
    pool.query(
      "SELECT First_Name, Last_Name, Username FROM Users",
      (error, results) => {
        if (error) {
          console.log(error.stack);
        }
        res.status(200).json(results.rows);
      }
    );
  } else {
    res.status(403).send();
  }
});

// GET | SELECT
app.get("/users/:user_name", authenticateToken, (req, res) => {
  const { user_name } = req.params;
  if (req.user.username == "Admin" || req.user.username == user_name) {
    pool.query(
      "SELECT First_Name, Last_Name, Username FROM Users WHERE Username = $1",
      [user_name],
      (error, results) => {
        if (error) {
          console.log(error.stack);
        }
        res.status(200).json(results.rows);
      }
    );
  } else {
    res.status(403).send();
  }
});

// GET | SELECT
app.get("/posts", (req, res) => {
  pool.query(
    "SELECT Posts.Creation_Date, Posts.Title, Posts.Content, Users.Username FROM Posts INNER JOIN Users ON Posts.Author = Users.User_ID",
    (error, results) => {
      if (error) {
        console.log(error.stack);
      }
      res.status(200).json(results.rows);
    }
  );
});

// GET | SELECT
app.get("/posts/:id", (req, res) => {
  const post_id = req.params.id;
  pool.query(
    "SELECT Posts.Creation_Date, Posts.Title, Posts.Content, Users.Username FROM Posts INNER JOIN Users ON Posts.Author = Users.User_ID WHERE Posts.Post_ID = $1",
    [post_id],
    (error, results) => {
      if (error) {
        console.log(error.stack);
      }
      res.status(200).json(results.rows);
    }
  );
});

// GET | SELECT
app.get("/my-posts", authenticateToken, (req, res) => {
  pool.query(
    "SELECT Posts.Creation_Date, Posts.Title, Posts.Content, Users.Username FROM Posts INNER JOIN Users ON Posts.Author = Users.User_ID WHERE Users.Username = $1",
    [req.user.username],
    (error, results) => {
      if (error) {
        console.log(error.stack);
      }
      res.status(200).json(results.rows);
    }
  );
});

// POST | INSERT
app.post("/my-posts", authenticateToken, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM Users WHERE Username = $1", [
    req.user.username,
  ]);
  let user = rows[0];
  let today = new Date();
  let dd = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
  let mm =
    today.getMonth() + 1 < 10
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1;
  let yyyy = today.getFullYear();
  let date = `${yyyy}-${mm}-${dd}`;
  pool.query(
    "INSERT INTO Posts (Creation_Date, Author, Title, Content) VALUES ($1, $2, $3, $4)",
    [date, user["user_id"], req.body.title, req.body.content],
    (error, results) => {
      if (error) {
        console.log(error.stack);
        res.status(500).send("An error occurred.");
      }
      res.status(200).json(results.rows);
    }
  );
});

// POST | UPDATE
app.post("/posts/:id/update", authenticateToken, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM Users WHERE Username = $1", [
    req.user.username,
  ]);
  let user = rows[0];
  pool.query(
    "UPDATE Posts SET Title = $1, Content = $2 WHERE Post_ID = $3 AND Author = $4",
    [req.body.title, req.body.content, req.params.id, user["user_id"]],
    (error, results) => {
      if (error) {
        console.error(error.stack);
        res.status(500).send("An error occurred.");
      }
      res.status(200).json(results.rows);
    }
  );
});

// POST | DELETE
app.delete("/posts/:id/update", authenticateToken, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM Users WHERE Username = $1", [
    req.user.username,
  ]);
  let user = rows[0];
  pool.query(
    "DELETE FROM Posts WHERE Post_ID = $1 AND Author = $2",
    [req.params.id, user["user_id"]],
    (error, results) => {
      if (error) {
        console.error(error.stack);
        res.status(500).send("An error occurred.");
      }
      res.status(200).json(results.rows);
    }
  );
});

// POST
app.post("/login", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT Username, Password FROM Users WHERE Username = $1",
      [req.body.username]
    );
    const user = rows[0];
    if (await bcrypt.compare(req.body.password, user["password"])) {
      const accessToken = generateAccessToken(user);
      // const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
      // res.json({ accessToken: accessToken, refreshToken: refreshToken });
      res.json({ accessToken: accessToken });
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.status(500).send();
  }
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 86400 });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send(err);
    req.user = user;
    next();
  });
}

app.listen(port, () =>
  console.log(`CRUD Test API listening at http://localhost:${port}`)
);