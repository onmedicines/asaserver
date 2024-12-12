import mongoose from "mongoose";

const facultySchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  subjects: [
    {
      name: { type: String, required: true },
      code: { type: String, required: true },
    },
  ],
});

export const Faculty = mongoose.model("Faculty", facultySchema);
