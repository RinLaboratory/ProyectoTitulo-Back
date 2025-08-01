/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";

import * as areasController from "../controllers/areas";
import { checkAdminMiddleware, checkUserMiddleware } from "~/middlewares/auth";

const areasRouter = Router();

areasRouter.use(checkUserMiddleware());

areasRouter.get("/", areasController.getAreas);

// admin
areasRouter.use(checkAdminMiddleware());
areasRouter.post("/", areasController.addArea);
areasRouter.put("/", areasController.editArea);
areasRouter.delete("/", areasController.deleteArea);

export default areasRouter;
