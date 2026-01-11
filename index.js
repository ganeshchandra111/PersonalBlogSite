import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import basicAuth from "express-basic-auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let data = null;

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const FILEPATH = "data.json";

async function ReadFile(FILEPATH) {
  try {
    const fileData = await fs.readFile(FILEPATH, "utf-8");
    let JSONFiledata = await JSON.parse(fileData);
    return JSONFiledata;
  } catch (err) {
    console.log(err);
    console.log("Something went wrong while reading the file . . .");
  }
}

async function WriteFile(FILEPATH, message) {
  try {
    await fs.writeFile(FILEPATH,"");
    const JSONmessage = JSON.stringify(message, null, 2);
    await fs.writeFile(FILEPATH, JSONmessage);
  } catch (err) {
    console.log(err);
    console.log("Something went wrong while writing the file . . .");
  }
}

app.get("/", async (req, res) => {
  data = await ReadFile(FILEPATH);
  res.redirect("/home");
});

app.get("/home", (req, res) => {
  return res.render("home", { articles: data });
});

app.get("/article/:ID", (req, res) => {
  const { ID } = req.params;
  const sendData = data.filter((id) => {
    return id.ID.toString() === ID;
  });
  return res.render("article", { content: sendData });
});

app.use("/admin",
  basicAuth({
    users: { admin: "1234" },
    challenge:true
  })
);

app.get("/admin", (req, res) => {
  res.render("admin", { articles: data });
});

app.get("/admin/new", async (req, res) => {
  
  res.render("new");
});

app.get("/admin/newarticle",async (req,res)=>{
    const { title, date, content } = req.query;
    const id = Math.floor(Math.random()*100000)
    console.log(req.query)
  data.push({ ID:id,Title: title, Date: date, Content: content });
  await WriteFile(FILEPATH, data);
  res.redirect("/admin")
})

app.get("/admin/update/:ID", async (req, res) => {
  const { ID } = req.params;
  const sendData = data.filter((id) => {
    return id.ID.toString() === ID;
  });
  return res.render("update", { content: sendData });
});

app.get("/admin/update", async (req, res) => {
  const { ID, content, title, date } = req.query;

  const UpdateDataOfID = data.filter((id) => {
    return id.ID.toString() === ID;
  });
  UpdateDataOfID[0].Title = title;
  UpdateDataOfID[0].Date = date;
  UpdateDataOfID[0].Content = content;

  await WriteFile(FILEPATH, data);

  res.redirect("/admin")
});

app.get("/admin/delete/:ID", async (req, res) => {
  const { ID } = req.params;

  const DeleteDataOfID = data.filter((id) => {
    return id.ID.toString() !== ID;
  });
  data = DeleteDataOfID;
  await WriteFile(FILEPATH, data);

  res.redirect("/admin");
});

app.listen(5000, () => {
  console.log("The app is running");
  console.log("http://localhost:5000/");
});
