import express from "express";
import signUpController from "../../../controllers/signup/signup.controller";
const signUpRouter = express.Router();

signUpRouter.post("/", async (req, res) => {
  const signupResponse = await signUpController(req.body);

  res.status(signupResponse.statusCode).json(signupResponse);
});

export default signUpRouter;
