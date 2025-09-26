// /* eslint-disable @typescript-eslint/no-explicit-any */
// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import  config  from ".";
// import { User } from "../app/modules/user/user.model";
// import { IsActive } from "../app/modules/user/user.interface";

// // Google OAuth Strategy
// passport.use(new GoogleStrategy({
//     clientID: config.social.google_client_id as string,
//     clientSecret: config.social.google_client_secret as string,
//     callbackURL: config.social.google_callback_url as string,

// }, async ( accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails?.[0].value;
//         if (!email) {
//           return done(null, false, { message: "No email found" });
//         }

//         let isUserExist = await User.findOne({ email });

//         if (isUserExist && !isUserExist.isVerified) {
//           return done(null, false, { message: "User is not verified" });
//         }

//         if (
//           isUserExist &&
//           (isUserExist.isActive === IsActive.BLOCKED ||
//             isUserExist.isActive === IsActive.INACTIVE)
//         ) {
//           return done(null, false, {
//             message: `User is ${isUserExist.isActive}`,
//           });
//         }
//         if (isUserExist && isUserExist.isDeleted) {
//           return done(null, false, { message: "User is deleted" });
//         }

//         if (!isUserExist) {
//           isUserExist = await User.create({
//             email,
//             name: profile.displayName,
//             image: profile.photos?.[0].value,
//             isVerified: true,
//           });
//         }
//         return done(null, isUserExist);
//       } catch (error) {
//         console.log("Google Strategy Error", error);
//         return done(error);
//       }
//     }));



// // Serialize & Deserialize User
// passport.serializeUser((user: any, done) => {
//     done(null, user._id);
// });

// passport.deserializeUser(async (id, done) => {
//     try {
//         const user = await User.findById(id);
//         done(null, user);
//     } catch (error) {
//         console.log(error)
//         done(error, null);
//     }
// });

// export default passport;