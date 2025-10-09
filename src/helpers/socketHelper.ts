import colors from "colors";
import { Server } from "socket.io";
import { logger } from "../shared/logger";
import { User } from "../app/modules/user/user.model";

const socket = (io: Server) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;

    // disconnect if userId is not provided
    if (!userId) {
      socket.emit("error", "User ID is required");
      socket.disconnect(true);
      return;
    }
    // User is now online
    logger.info(colors.blue("A user connected"));
    User.findByIdAndUpdate(userId, { isOnline: true }).catch((err) => {
      logger.error(
        colors.red(`Error updating user online status: ${err.message}`)
      );
    });
    io.emit("userStatus", { userId, isOnline: true });

    //disconnect
    socket.on("disconnect", () => {
      logger.info(colors.red("A user disconnect"));
      if (userId) {
        // User is now offline
        User.findByIdAndUpdate(userId, { isOnline: false }).catch((err) => {
          logger.error(
            colors.red(`Error updating user online status: ${err.message}`)
          );
        });
        io.emit("userStatus", { userId, isOnline: false });
      }
    });
  });
};

export const socketHelper = { socket };
