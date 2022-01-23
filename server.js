require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3001; //8000;
}
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  connectionString: process.env.DATABASE_URI,
  ssl: {
    rejectUnauthorized: false,
  },
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

app.get("/", (req, res) => {
  res.send("API is running.")
})

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
        res
          .status(200)
          .send({ message: `${user} was registered successfully!` });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: err.message });
  }
});

// GET | SELECT
// Get all Users
app.get("/users", (req, res) => {
  pool.query(
    "SELECT User_ID, First_Name, Last_Name, Username FROM Users",
    (error, results) => {
      if (error) {
        res.send({ message: error.message });
      }
      res.status(200).json(results.rows);
    }
  );
});

// GET | SELECT
// Get all Posts
const getPosts = (callback) => {
  pool.query(
    "SELECT Posts.Post_ID, Posts.Creation_Date, Posts.Title, Posts.Content, Users.Username, Users.First_Name, Users.Last_Name FROM Posts INNER JOIN Users ON Posts.Author = Users.User_ID",
    callback
  );
};
app.get("/posts", (req, res) => {
  getPosts((error, results) => {
    if (error) {
      console.error(error.message);
    }
    res.status(200).json(results.rows);
  });
});

// GET | SELECT
// Get a Post by ID
app.get("/posts/:id", (req, res) => {
  const post_id = req.params.id;
  pool.query(
    "SELECT Posts.Post_ID, Posts.Creation_Date, Posts.Title, Posts.Content, Users.Username, Users.First_Name, Users.Last_Name FROM Posts INNER JOIN Users ON Posts.Author = Users.User_ID WHERE Posts.Post_ID = $1",
    [post_id],
    (error, results) => {
      if (error) {
        res.send({ message: error.message });
      }
      res.status(200).json(results.rows[0]);
    }
  );
});

// POST | INSERT
// Create a Post
app.post("/posts", authenticateToken, async (req, res) => {
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
        res.status(200).json(results.rows[0]);
      }
    );
  } catch (err) {
    console.error(err.message);
  }
});

// PUT | UPDATE
// Update a Post
app.put("/posts/:id", authenticateToken, async (req, res) => {
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
      res.status(200).json(results.rows[0]);
    }
  );
});

// POST | DELETE
// Delete a Post
app.delete("/posts/:id", authenticateToken, async (req, res) => {
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
      "SELECT Username, Password, User_ID FROM Users WHERE Username = $1",
      [req.body.username]
    );
    const user = rows[0] && rows[0]["password"] ? rows[0] : null;
    if (
      user !== null &&
      (await bcrypt.compare(req.body.password, user["password"]))
    ) {
      const accessToken = generateAccessToken(user);
      res.status(200).send({
        username: user["username"],
        user_id: user["user_id"],
        accessToken: accessToken,
      });
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
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 21600 });
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

app.listen(port, () => console.log(`API is running on ${port}`));
