import express, { Request, Response } from "express";
import { internalServerErrorReturn } from "./common/commonReturns";
import { httpLogger, logger } from "./logger";
import rootRouter from "./routes/root.route";

/**
 * certain PaaS providers may allocate a port for the app to listen
 * in that case PORT will be used
 * else EXPRESS_PORT is used
 */
const PORT = process.env["PORT"] || process.env["EXPRESS_PORT"];

const app = express();

app.use(httpLogger);

/**
 * for parsing the request body as json
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * fallback error handling for express
 */
app.use((err: Error, req: Request, res: Response, next: Function) => {
  if (err) logger.error(err.message);

  res.status(internalServerErrorReturn.statusCode).json(internalServerErrorReturn);
});

/**
 * all routes will be handled by the root router
 */
app.use("/", rootRouter);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
