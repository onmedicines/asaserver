import mongoose from "mongoose";
import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Student } from "./schema/student.js";
import { Admin } from "./schema/admin.js";
import { Faculty } from "./schema/faculty.js";
import { Assignment } from "./schema/assignment.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(fileUpload());
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

// ROUTES
app.post("/student/register", async (req, res) => {
  try {
    const { rollNumber, name, semester, password } = req.body;
    if (!rollNumber || !name || !semester || !password) throw new Error("One or More Fields missing.");
    if (semester < 1 || semester > 6) throw new Error("Semester does not exist");
    let subjects = [];

    switch (semester) {
      case "1":
        subjects = [
          { name: "Sub1", code: 101 },
          { name: "Sub2", code: 102 },
          { name: "Sub3", code: 103 },
        ];
        break;
      case "2":
        subjects = [
          { name: "Sub1", code: 104 },
          { name: "Sub2", code: 105 },
          { name: "Sub3", code: 106 },
        ];
        break;
      case "3":
        subjects = [
          { name: "Sub1", code: 107 },
          { name: "Sub2", code: 108 },
          { name: "Sub3", code: 109 },
        ];
        break;
      case "4":
        subjects = [
          { name: "Sub1", code: 110 },
          { name: "Sub2", code: 111 },
          { name: "Sub3", code: 112 },
        ];
        break;
      case "5":
        subjects = [
          { name: "Sub1", code: 113 },
          { name: "Sub2", code: 114 },
          { name: "Sub3", code: 115 },
        ];
        break;
      case "6":
        subjects = [
          { name: "Sub1", code: 116 },
          { name: "Sub2", code: 117 },
          { name: "Sub3", code: 118 },
        ];
        break;
      default:
        subjects = [];
        break;
    }

    await Student.create({
      name,
      rollNumber,
      semester,
      password,
      subjects,
    });
    const token = await generateToken({ rollNumber, role: "student" });
    if (!token) throw new Error("Token generation failed but record was created");
    return res.status(200).json({ message: "registered successfully", token });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

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

app.get("/getStudentInfo", authenticate, async (req, res) => {
  try {
    const { rollNumber, role } = req.payload;
    if (role !== "student") throw new Error("Unauthorized");
    const student = await Student.findOne({ rollNumber }, { password: 0 });
    return res.status(200).json({ message: "data fetched successfully", student });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
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

app.post("/submitAssignment", authenticate, async (req, res) => {
  try {
    const { rollNumber, role } = req.payload;
    if (role !== "student") throw new Error("Cannot authenticate");
    const { file } = req.files;
    let { code } = req.body;
    code = Number(code);
    if (!file || !code) throw new Error("File or code missing");

    const assignment = await Assignment.create({
      code,
      rollNumber,
      file: {
        name: file.name,
        data: file.data,
        mimetype: file.mimetype,
        size: file.size,
      },
    });
    const student = await Student.findOneAndUpdate({ rollNumber, "subjects.code": code }, { $set: { "subjects.$.isSubmitted": true } });

    if (!assignment || !student) throw new Error("Something went wrong");

    return res.status(200).json({ message: "assignment submitted successfully" });
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
