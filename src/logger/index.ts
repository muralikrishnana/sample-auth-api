import expressLogger from "./expressLogger";
import winstonLogger from "./winstonLogger";

const logger = winstonLogger();
const httpLogger = expressLogger();

export { logger, httpLogger };
