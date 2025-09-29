import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { errorLogger, logger } from "./shared/logger";
import colors from "colors";
import { socketHelper } from "./helpers/socketHelper";
import { Server } from "socket.io";
import seedSuperAdmin from "./DB";

//uncaught exception
process.on("uncaughtException", (error) => {
  errorLogger.error("uncaughtException Detected", error);
  process.exit(1);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let server: any;

async function main() {
  try {
    mongoose.connect(config.database_url as string);
    logger.info(colors.green("🚀 Database connected successfully"));

    // create super admin
    seedSuperAdmin();

    const port =
      typeof config.port === "number" ? config.port : Number(config.port);

    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(`♻️  Application listening on port:${config.port}`)
      );
    });
    //socket
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: "*",
      },
    });

    socketHelper.socket(io);

    global.io = io;
  } catch (error) {
    errorLogger.error(colors.red("🤢 Failed to connect Database"));
    process.exit(1);
  }

  //handle unhandledRejection
  process.on("unhandledRejection", (error) => {
    if (server) {
      server.close(() => {
        errorLogger.error("UnhandledRejection Detected", error);

        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

//SIGTERM
process.on("SIGTERM", () => {
  logger.info("SIGTERM IS RECEIVE");
  if (server) {
    server.close();
  }
});
