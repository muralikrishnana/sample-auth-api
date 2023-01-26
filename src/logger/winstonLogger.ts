import winston from "winston";

/**
 * logger to log anything inside the server
 */
const winstonLogger = () => {
  return winston.createLogger({
    level: "debug",
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
  });
};

export default winstonLogger;
