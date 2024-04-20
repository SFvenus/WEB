require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Theme model schema
const themeSchema = new mongoose.Schema(
  {
    name: String,
  },
  { timestamps: false }
);

const Theme = mongoose.model("Theme", themeSchema);

// Set model schema
const setSchema = new mongoose.Schema(
  {
    set_num: { type: String, index: { unique: true } },
    name: String,
    year: Number,
    num_parts: Number,
    theme_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theme",
    },
    img_url: String,
  },
  { timestamps: false }
);

const Set = mongoose.model("Set", setSchema);

async function initialize() {
  try {
    await mongoose.connection;
    console.log("Connected to MongoDB");
  } catch (err) {
    throw new Error(err.message);
  }
}

// CRUD operations adjusted for Mongoose
async function getAllSets() {
  return Set.find().populate("theme_id");
}

async function getAllThemes() {
  return Theme.find();
}

async function getSetByNum(setNum) {
  const set = await Set.findOne({ set_num: setNum }).populate("theme_id");
  if (!set) throw new Error("Unable to find requested set");
  return set;
}

async function getSetsByTheme(theme) {
  const themes = await Theme.find({ name: new RegExp(theme, "i") });
  const sets = await Set.find({
    theme_id: { $in: themes.map((t) => t._id) },
  }).populate("theme_id");
  if (!sets.length) throw new Error("Unable to find requested sets");
  return sets;
}

async function addSet(setData) {
  const theme = await Theme.findOne({ _id: setData.theme_id });
  if (!theme) throw new Error("Theme does not exist");
  await Set.create(setData);
}

async function editSet(set_num, setData) {
  const result = await Set.updateOne({ set_num: set_num }, setData);
  if (result.matchedCount === 0) throw new Error("Set not found");
}

async function deleteSet(set_num) {
  const result = await Set.deleteOne({ set_num: set_num });
  if (result.deletedCount === 0) throw new Error("Set not found");
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  getAllThemes,
  addSet,
  editSet,
  deleteSet,
};
