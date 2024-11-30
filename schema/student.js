import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  rollNumber: { type: Number, required: true },
  name: { type: String, required: true },
  semester: { type: Number, required: true },
  password: { type: String, required: true },
  subjects: [
    {
      name: { type: String, required: true },
      code: { type: String, required: true },
    },
  ],
});

export const Student = mongoose.model("Student", studentSchema);
