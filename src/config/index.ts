import dotenv from "dotenv";
import path from "path";
dotenv.config({path: path.join(process.cwd(), '.env')});

export default{
    server_name:process.env.SERVER_NAME,
    ip_address: process.env.IP,
    port: process.env.PORT,
    port_dev: process.env.PORT_DEV,
    database_url: process.env.DATABASE_URL,
    node_env: process.env.NODE_ENV,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        jwt_expire_in: process.env.JWT_EXPIRE_IN,
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
        jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN
    },
    stripe:{
        stripeSecretKey:process.env.STRIPE_API_SECRET,
        webhookSecret:process.env.WEBHOOK_SECRET,
        paymentSuccess:process.env.WEBHOOK_SECRET
    },
    email:{
        from: process.env.EMAIL_FROM,
        user: process.env.EMAIL_USER,
        port: process.env.EMAIL_PORT,
        host: process.env.EMAIL_HOST,
        pass: process.env.EMAIL_PASS
    },
    social: {
        google_client_id: process.env.GOOGLE_CLIENT_ID,
        facebook_client_id: process.env.FACEBOOK_CLIENT_ID,
        google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
        facebook_client_secret: process.env.FACEBOOK_CLIENT_SECRET
    },
    super_admin: {
        email:process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD

    },
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        twilioNumber: process.env.TWILIO_NUMBER
    }
}