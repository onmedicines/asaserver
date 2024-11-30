import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Student } from "./schema/student.js";
import { Admin } from "./schema/admin.js";
import { Faculty } from "./schema/faculty.js";
import { Subject } from "./schema/subject.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server running on port ", PORT);
});

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("Connected to Atlas."))
  .catch((err) => console.log("Could not connect to atlas."));

// helper funtion
function generateToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.SECRET_KEY, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
}

async function authenticate(req, res, next) {
  try {
    // format: BEARER <token>
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) throw new Error("cannot be authorized!!");
    const payload = await verifyToken(token);
    req.payload = payload;
    next();
  } catch (err) {
    res.status(401).json({ errorAuthenticate: err.message });
  }
}

app.get("/", (req, res) => {
  res.send("<h1>Hello there</h1>");
});

// REGISTER
app.post("/student/register", async (req, res) => {
  try {
    const { rollNumber, name, semester, password, subjects } = req.body;
    console.log(subjects);
    if (!rollNumber || !name || !semester || !password || !subjects) throw new Error("One or More Fields missing.");
    await Student.create({
      name,
      rollNumber,
      semester,
      password,
      subjects,
    });
    const token = await generateToken({ rollNumber, role: "student" });

    return res.status(200).json({ message: "registered successfully", token });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
});

// LOGIN
app.post("/student/login", async (req, res) => {
  try {
    const { rollNumber, password } = req.body;
    const student = await Student.findOne({ rollNumber });
    if (!student) throw new Error("student not found.");
    if (password !== student.password) throw new Error("Invalid credentials");
    const token = await generateToken({ rollNumber, role: "student" });
    if (!token) throw new Error("Token generation failed");
    return res.status(200).json({ message: "logged in successfully", token });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

app.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) throw new Error("admin does not exist");
    if (admin.password !== password) throw new Error("Invalid credentials");
    const token = await generateToken({ username, role: "admin" });
    if (!token) throw new Error("Token generation failed");
    return res.status(200).json({ message: "admin logged in successfully", token });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "some error occured" });
  }
});

app.post("/faculty/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const faculty = await Faculty.findOne({ username });
    if (!faculty) throw new Error("faculty does not exist");
    if (faculty.password !== password) throw new Error("Invalid credentials");
    const token = await generateToken({ username, role: "faculty" });
    if (!token) throw new Error("Token generation failed");
    return res.status(200).json({ message: "faculty logged in successfully", token });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "some error occured" });
  }
});

app.get("/student/dashboard", authenticate, async (req, res) => {
  try {
    const { rollNumber, role } = req.payload;
    if (role !== "student") throw new Error(`Token expected for student, received for ${roll}`);
    const student = await Student.findOne({ rollNumber }, { rollNumber: 1, name: 1, semester: 1, subjects: 1 });
    if (!student) throw new Error("Cannot access student details");
    return res.status(200).json({ message: "Fetched data successfully", student });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});
