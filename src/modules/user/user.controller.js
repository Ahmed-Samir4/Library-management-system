import { Router } from "express";

import * as userService from "./user.service.js";
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middleware/auth.js";
import * as userValidation from "./user.validation.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";

const userRouter = Router();


userRouter.post("/signup", validationMiddleware(userValidation.signUpSchema), expressAsyncHandler(userService.signUp));
userRouter.post("/login", validationMiddleware(userValidation.loginSchema), expressAsyncHandler(userService.login));
userRouter.post("/verify", validationMiddleware(userValidation.verifyEmailSchema), expressAsyncHandler(userService.verifyEmail));
userRouter.post("/requestCode", validationMiddleware(userValidation.requestCodeSchema), expressAsyncHandler(userService.requestVerCode));


userRouter.get("/refresh", validationMiddleware(userValidation.refreshTokenSchema), expressAsyncHandler(userService.refreshToken));
userRouter.post("/forget", validationMiddleware(userValidation.forgotPasswordSchema), expressAsyncHandler(userService.forgotPassword));
userRouter.post("/reset", validationMiddleware(userValidation.resetPasswordSchema), expressAsyncHandler(userService.resetPassword));

userRouter.delete("/delete", auth(), expressAsyncHandler(userService.deleteAccount));
userRouter.get("/all", expressAsyncHandler(userService.getAllUsers));

export default userRouter;