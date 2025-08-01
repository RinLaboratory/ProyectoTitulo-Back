/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";

import * as usersController from "../controllers/users";
import { checkAdminMiddleware, checkUserMiddleware } from "~/middlewares/auth";

const usersRouter = Router();

usersRouter.use(checkUserMiddleware());

usersRouter.get("/:id", usersController.getCurrentUser);

// admin
usersRouter.use(checkAdminMiddleware());
usersRouter.get("/", usersController.getUsers);
usersRouter.put("/", usersController.editUser);
usersRouter.delete("/", usersController.deleteUser);

export default usersRouter;
