const mongoose = require("mongoose");
const { Schema } = mongoose;

const projectSchema = new Schema({
  image: {
    type: String,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
