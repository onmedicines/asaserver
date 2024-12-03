import mongoose from "mongoose";

const assignmentSchema = mongoose.Schema({
  code: { type: Number, required: true },
  rollNumber: { type: Number, required: true },
  file: {
    name: { type: String, required: true },
    data: { type: Buffer, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number },
  },
});

export const Assignment = mongoose.model("Assignment", assignmentSchema);
