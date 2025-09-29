import { z } from "zod";

const createChatZodSchema = z.object({
  body: z.object({
    otherParticipantId: z.string({
      required_error: "Other Participant id is required",
    }),
  }),
});

export const ChatValidations = { createChatZodSchema };
