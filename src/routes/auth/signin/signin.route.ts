import express from "express";
import signInController from "../../../controllers/signin/signin.controller";
const signInRouter = express.Router();

signInRouter.post("/", async (req, res) => {
  const signInResponse = await signInController(req.body);

  res.status(signInResponse.statusCode).json(signInResponse);
});

export default signInRouter;
