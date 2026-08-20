import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const usersFilePath = path.join(__dirname, "users.json");

app.use(express.json());

// Helper functions
async function readUsers() {
  try {
    const data = await fs.readFile(usersFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeUsers(users) {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

// 1. POST /user - Add new user
app.post("/user", async (req, res) => {
  try {
    const { name, age, email } = req.body;

    if (!name || !age || !email) {
      return res.status(400).json({ message: "Name, age and email are required." });
    }

    const users = await readUsers();

    const emailExists = users.find((user) => user.email === email);
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

    const newUser = {
      id: newId,
      name,
      age,
      email,
    };

    users.push(newUser);
    await writeUsers(users);

    res.status(201).json({ message: "User added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// 2. PATCH /user/:id - Update user
app.patch("/user/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, age, email } = req.body;

    const users = await readUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User ID not found." });
    }

    if (name !== undefined) users[userIndex].name = name;
    if (age !== undefined) users[userIndex].age = age;
    if (email !== undefined) users[userIndex].email = email;

    await writeUsers(users);

    // رسالة حسب اللي اتعدل
    let message = "User updated successfully.";
    if (age !== undefined && name === undefined && email === undefined) {
      message = "User age updated successfully.";
    }

    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// 3. DELETE /user/:id - Delete user
app.delete("/user/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const users = await readUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User ID not found." });
    }

    users.splice(userIndex, 1);
    await writeUsers(users);

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// 4. GET /user/getByName - Get user by name
app.get("/user/getByName", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Name query parameter is required." });
    }

    const users = await readUsers();
    const user = users.find((u) => u.name.toLowerCase() === name.toLowerCase());

    if (!user) {
      return res.status(404).json({ message: "User name not found." });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// 5. GET /user - Get all users
app.get("/user", async (req, res) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// 6. GET /user/filter - Filter users by minAge
app.get("/user/filter", async (req, res) => {
  try {
    const minAge = parseInt(req.query.minAge);

    if (isNaN(minAge)) {
      return res.status(400).json({ message: "minAge query parameter is required and must be a number." });
    }

    const users = await readUsers();
    const filteredUsers = users.filter((user) => user.age >= minAge);

    if (filteredUsers.length === 0) {
      return res.status(404).json({ message: "no user found" });
    }

    res.json(filteredUsers);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// 7. GET /user/:id - Get user by ID
app.get("/user/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const users = await readUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});



//Bonus

/**
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function(strs) {
  if (!strs || strs.length === 0) return "";

  let prefix = strs[0];

  for (let i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, prefix.length - 1);
      if (prefix === "") return "";
    }
  }

  return prefix;
};

console.log(longestCommonPrefix(["flower", "flow", "flight"]));
console.log(longestCommonPrefix(["dog", "racecar", "car"]));


// ========================================
// Node Internals
// ========================================

// 1. What is the Node.js Event Loop?
// The Event Loop is the core mechanism that allows Node.js
// to handle asynchronous operations by continuously checking
// the Call Stack and executing callbacks from the Event Queue
// when the stack is empty.


// 2. What is Libuv and What Role Does It Play in Node.js?
// Libuv is a C library that provides the Event Loop, Thread Pool,
// and asynchronous I/O capabilities, enabling Node.js to work
// across different operating systems.


// 3. How Does Node.js Handle Asynchronous Operations Under the Hood?
// Asynchronous operations are offloaded to Libuv
// (and the Thread Pool if needed).
// Once completed, their callbacks are placed in the Event Queue
// and executed by the Event Loop when the Call Stack is free.


// 4. What is the Difference Between the Call Stack, Event Queue,
// and Event Loop in Node.js?
// The Call Stack executes the current code.
// The Event Queue stores completed asynchronous callbacks.
// The Event Loop moves those callbacks to the Call Stack
// when it is empty.


// 5. What is the Node.js Thread Pool and How to Set the Thread Pool Size?
// The Thread Pool, provided by Libuv, handles blocking operations
// like file system tasks.
// Its default size is 4.
// You can change it using:
// UV_THREADPOOL_SIZE=8
// or:
// process.env.UV_THREADPOOL_SIZE = 8


// 6. How Does Node.js Handle Blocking and Non-Blocking Code Execution?
// Non-blocking (asynchronous) code runs in the background
// without stopping the Event Loop.
// Blocking (synchronous) code freezes the entire Event Loop
// until it finishes.