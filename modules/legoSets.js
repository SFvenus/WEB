require("dotenv").config();

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

const Theme = sequelize.define(
  "Theme",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

const Set = sequelize.define(
  "Set",
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: {
      type: Sequelize.INTEGER,
      references: {
        model: Theme,
        key: "id",
      },
    },
    img_url: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

Set.belongsTo(Theme, { foreignKey: "theme_id" });

async function initialize() {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");

  await sequelize.sync();
  console.log("All models were synchronized successfully.");

  const setData = require("../data/setData");
  const themeData = require("../data/themeData");

  const themesCount = await Theme.count();
  if (themesCount === 0) {
    await Theme.bulkCreate(themeData);
  }

  const setsCount = await Set.count();
  if (setsCount === 0) {
    await Set.bulkCreate(setData);
  }
}

function getAllSets() {
  return Set.findAll({
    include: Theme,
  });
}

function getAllThemes() {
  return Theme.findAll();
}

async function getSetByNum(setNum) {
  const found = await Set.findByPk(setNum, {
    include: Theme,
  });

  if (!found) {
    throw "Unable to find requested set.";
  }

  return found;
}

async function getSetsByTheme(theme) {
  const sets = await Set.findAll({
    include: Theme,
    where: {
      "$Theme.name$": {
        [Sequelize.Op.iLike]: `%${theme}%`,
      },
    },
  });

  if (sets.length === 0) {
    throw "Unable to find requested sets.";
  }

  return sets;
}

async function addSet(set) {
  try {
    await Set.create(set);
  } catch (ex) {
    throw ex.errors[0].message;
  }
}

async function editSet(set_num, setData) {
  try {
    const [affected_rows] = await Set.update(setData, {
      where: {
        set_num: set_num,
      },
    });

    if (affected_rows === 0) {
      throw { errors: [{ message: "Unable to find requested set." }] };
    }
  } catch (ex) {
    throw ex.errors[0].message;
  }
}

async function deleteSet(setNum) {
  try {
    const affected_rows = await Set.destroy({
      where: {
        set_num: setNum,
      },
    });

    if (affected_rows === 0) {
      throw { errors: [{ message: "Unable to find requested set." }] };
    }
  } catch (ex) {
    throw ex.errors[0].message;
  }
}

module.exports = {
  initialize,
  getAllSets,
  getAllThemes,
  getSetByNum,
  getSetsByTheme,

  addSet,
  deleteSet,
  editSet,
};
