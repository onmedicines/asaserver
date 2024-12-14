import mongoose from "mongoose";

const semesterSchema = mongoose.Schema({
  semester: { type: Number, required: true },
  subjects: [
    {
      name: { type: String, required: true },
      code: { type: String, required: true },
    },
  ],
});

export const Semester = mongoose.model("Semester", semesterSchema);
