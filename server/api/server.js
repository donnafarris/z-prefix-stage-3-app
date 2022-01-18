require("dotenv").config();
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
  database: "z-prefix",
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
// Create a User
app.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    pool.query(
      "INSERT INTO Users (First_Name, Last_Name, Username, Password) VALUES ($1, $2, $3, $4) RETURNING Username",
      [
        req.body.first_name,
        req.body.last_name,
        req.body.username,
        hashedPassword,
      ],
      (error, results) => {
        if (error) {
          res.status(400).send({ message: error.message });
        }
        let user = results.rows[0]["username"];
        res.status(200).send({ message: `${user} was registered successfully!` });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: err.message });
  }
});

// GET | SELECT
// Get all Users
app.get("/users", authenticateToken, (req, res) => {
  if (req.user.username == "Admin") {
    pool.query("SELECT User_ID, First_Name, Last_Name, Username FROM Users", (error, results) => {
      if (error) {
        res.send({ message: error.message });
      }
      res.status(200).json(results.rows);
    });
  } else {
    res.status(403).send();
  }
});

// GET | SELECT
// Get a User
app.get("/users/:user_name", authenticateToken, (req, res) => {
  const { user_name } = req.params;
  if (req.user.username == "Admin" || req.user.username == user_name) {
    pool.query(
      "SELECT First_Name, Last_Name, Username FROM Users WHERE Username = $1",
      [user_name],
      (error, results) => {
        if (error) {
          res.send({ message: error.message });
        }
        res.status(200).json(results.rows);
      }
    );
  } else {
    res.status(403).send();
  }
});

// GET | SELECT
// Get all Posts
app.get("/posts", (req, res) => {
  pool.query(
    "SELECT Posts.Post_ID, Posts.Creation_Date, Posts.Title, Posts.Content, Users.Username, Users.First_Name, Users.Last_Name FROM Posts INNER JOIN Users ON Posts.Author = Users.User_ID",
    (error, results) => {
      if (error) {
        res.send({ message: error.message });
      }
      res.status(200).json(results.rows);
    }
  );
});

// GET | SELECT
// Get a Post
app.get("/posts/:id", (req, res) => {
  const post_id = req.params.id;
  pool.query(
    "SELECT Posts.Post_ID, Posts.Creation_Date, Posts.Title, Posts.Content, Users.Username, Users.First_Name, Users.Last_Name FROM Posts INNER JOIN Users ON Posts.Author = Users.User_ID WHERE Posts.Post_ID = $1",
    [post_id],
    (error, results) => {
      if (error) {
        res.send({ message: error.message });
      }
      res.status(200).json(results.rows);
    }
  );
});

// GET | SELECT
// Get all Posts by Current User
app.get("/my-posts", authenticateToken, (req, res) => {
  pool.query(
    "SELECT Posts.Post_ID, Posts.Creation_Date, Posts.Title, Posts.Content, Users.Username, Users.First_Name, Users.Last_Name FROM Posts INNER JOIN Users ON Posts.Author = Users.User_ID WHERE Users.Username = $1",
    [req.user.username],
    (error, results) => {
      if (error) {
        res.send({ message: error.message });
      }
      res.status(200).json(results.rows);
    }
  );
});

// POST | INSERT
// Create a Post
app.post("/create-post", authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM Users WHERE Username = $1",
      [req.user.username]
    );
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
      "INSERT INTO Posts (Creation_Date, Author, Title, Content) VALUES ($1, $2, $3, $4) RETURNING *",
      [date, user["user_id"], req.body.title, req.body.content],
      (error, results) => {
        if (error) {
          res.status(500).send({ message: error.message });
        }
        res.status(200).json(results.rows);
      }
    );
  } catch (err) {
    res.send({ message: error.message });
    console.error(err.message);
  }
});

// POST | UPDATE
// Update a Post
app.post("/posts/:id/update", authenticateToken, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM Users WHERE Username = $1", [
    req.user.username,
  ]);
  let user = rows[0];
  pool.query(
    "UPDATE Posts SET Title = $1, Content = $2 WHERE Post_ID = $3 AND Author = $4 RETURNING *",
    [req.body.title, req.body.content, req.params.id, user["user_id"]],
    (error, results) => {
      if (error) {
        res.status(500).send({ message: "An error occurred." });
      }
      res.status(200).json(results.rows);
    }
  );
});

// POST | DELETE
// Delete a Post
app.delete("/posts/:id/delete", authenticateToken, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM Users WHERE Username = $1", [
    req.user.username,
  ]);
  let user = rows[0];
  pool.query(
    "DELETE FROM Posts WHERE Post_ID = $1 AND Author = $2",
    [req.params.id, user["user_id"]],
    (error, results) => {
      if (error) {
        res.status(500).send({ message: "An error occurred." });
      }
      res.status(200).send({ message: "The post was deleted." });
    }
  );
});

// Authentication
app.post("/login", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT Username, Password FROM Users WHERE Username = $1",
      [req.body.username]
    );
    const user = rows[0] && rows[0]["password"] ? rows[0] : null;
    if (
      user !== null &&
      (await bcrypt.compare(req.body.password, user["password"]))
    ) {
      const accessToken = generateAccessToken(user);
      res
        .status(200)
        .send({ username: user["username"], accessToken: accessToken });
    } else if (user == null) {
      res.status(404).send({ message: "User does not exist." });
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
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
