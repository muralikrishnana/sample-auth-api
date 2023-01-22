import express from "express";
import signInRouter from "./signin/signin.route";
import signUpRouter from "./signup/signup.route";

const authRouter = express.Router();

authRouter.use("/signup", signUpRouter);
authRouter.use("/login", signInRouter);

export default authRouter;
