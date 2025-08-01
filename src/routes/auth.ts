import { Router } from "express";

import * as authController from "../controllers/auth";
import { checkAdminMiddleware, checkUserMiddleware } from "~/middlewares/auth";

const authRouter = Router();

authRouter.post("/login", authController.login);

authRouter.use(checkUserMiddleware());

authRouter.post("/change-password", authController.changePassword);

// admin
authRouter.use(checkAdminMiddleware());
authRouter.post("/register", authController.register);

export default authRouter;
