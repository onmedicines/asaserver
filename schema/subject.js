import mongoose from "mongoose";

const subjectSchema = mongoose.Schema({
  code: { type: String, required: true },
  teacher: { type: String, required: true },
  assignments: [
    {
      rollNumber: { type: String, required: true },
      file: {
        data: { type: Buffer, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number },
      },
    },
  ],
});

export const Subject = mongoose.model("Subject", subjectSchema);
