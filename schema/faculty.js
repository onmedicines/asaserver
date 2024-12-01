import mongoose from "mongoose";

const facultySchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

export const Faculty = mongoose.model("Faculty", facultySchema);
