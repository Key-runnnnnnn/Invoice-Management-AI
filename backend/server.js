const express = require("express");
const app = express();
const path = require("path");
const cors =require("cors");
const connectDB = require("./config/connectdb");

const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
  console.error("Error: MONGO_URI missing");
  process.exit(1);
}

connectDB();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const geminiRoute = require("./routes/geminiRoute");
app.use("/api/data", geminiRoute);


app.use(express.static(path.join(__dirname, "../frontend", "dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});


app.listen(PORT, () => {
  console.log(`Server is Listening on http://localhost:${PORT}`);
});
