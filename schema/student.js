import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  rollNumber: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  semester: { type: Number, required: true, min: 1, max: 6 },
  password: { type: String, required: true },
  subjects: [
    {
      name: { type: String, required: true },
      code: { type: Number, required: true },
      isSubmitted: { type: Boolean, required: true, default: false },
    },
  ],
});

export const Student = mongoose.model("Student", studentSchema);
