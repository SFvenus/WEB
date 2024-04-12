/********************************************************************************
 *  WEB322 – Assignment 04
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
*  Name: Soheila Fallah Mollamahmoud Student ID: 142016229 Date: 2024-03-30
 *
*  Published URL: https://average-gold-cod.cyclic.app/
 *
 ********************************************************************************/
const legoData = require("./modules/legoSets");

const express = require("express");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

function renderNotFoundErrorPage(res, message) {
  res.status(404).render("404", { message });
}

function renderServerErrorPage(res, message) {
  res.render("500", { message });
}

app.get("/lego/sets", async (req, res) => {
  try {
    if (req.query.theme) {
      let sets = await legoData.getSetsByTheme(req.query.theme);
      res.render("sets", { sets });
    } else {
      let sets = await legoData.getAllSets();
      res.render("sets", { sets });
    }
  } catch (err) {
    renderNotFoundErrorPage(res, err);
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { set });
  } catch (err) {
    renderNotFoundErrorPage(res, err);
  }
});

app.get("/lego/addSet", async (req, res) => {
  const themes = await legoData.getAllThemes();
  res.render("addSet", { themes });
});

app.post("/lego/addSet", async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    renderServerErrorPage(
      res,
      `I'm sorry, but we have encountered the following error: ${err}`
    );
  }
});

app.get("/lego/editSet/:num", async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.num);
    const themes = await legoData.getAllThemes();
    res.render("editSet", { set, themes });
  } catch (err) {
    renderNotFoundErrorPage(res, err);
  }
});

app.post("/lego/editSet/:num", async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    renderServerErrorPage(
      res,
      `I'm sorry, but we have encountered the following error: ${err}`
    );
  }
});

app.get("/lego/deleteSet/:num", async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    renderServerErrorPage(
      res,
      `I'm sorry, but we have encountered the following error: ${err}`
    );
  }
});

app.use((req, res, next) => {
  renderNotFoundErrorPage(res, "No view matched for a specific route");
});

legoData.initialize().then(
  () => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  },
  (ex) => {
    console.error(ex);
  }
);
