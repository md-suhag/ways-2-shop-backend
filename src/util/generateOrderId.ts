import { nanoid } from "nanoid";

export const generateOrderId = () => {
  return `ORD-${nanoid(8).toUpperCase()}`;
};
