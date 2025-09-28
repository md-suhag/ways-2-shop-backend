import { transporter } from "../../../helpers/emailHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import { errorLogger, logger } from "../../../shared/logger";
import { IContactUs } from "../../../types/emailTemplate";

const contactUs = async (payload: IContactUs) => {
  const contactUsTemplate = emailTemplate.contactUs(payload);

  try {
    const info = await transporter.sendMail({
      from: `${payload.name} ${payload.email}`,
      to: contactUsTemplate.to,
      subject: contactUsTemplate.subject,
      html: contactUsTemplate.html,
      replyTo: `${payload.email}`,
    });

    logger.info("Mail send successfully", info.accepted);
  } catch (error) {
    errorLogger.error("Email", error);
  }
};

export const AdminServices = { contactUs };
