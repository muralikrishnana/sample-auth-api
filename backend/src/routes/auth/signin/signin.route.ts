import express from "express";
const signInRouter = express.Router();

signInRouter.get("/", (req, res) => {
  res.json("Hello from signin route");
});

export default signInRouter;
