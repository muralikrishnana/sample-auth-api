import express from "express";
import authRouter from "./auth/auth.route";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);

export default rootRouter;
