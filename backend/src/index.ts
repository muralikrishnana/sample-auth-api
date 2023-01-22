import express from "express";
import rootRouter from "./routes/root.route";

const PORT = process.env["EXPRESS_PORT"];

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", rootRouter);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
