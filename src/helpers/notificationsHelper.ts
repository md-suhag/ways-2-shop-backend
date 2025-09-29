import { INotification } from "../app/modules/notification/notification.interface";
import { Notification } from "../app/modules/notification/notification.model";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendNotifications = async (data: any): Promise<INotification> => {
  const result = await Notification.create(data);

  const socketIo = global.io;

  if (socketIo) {
    socketIo.emit(`get-notification::${data?.receiver}`, result);
  }

  return result;
};
