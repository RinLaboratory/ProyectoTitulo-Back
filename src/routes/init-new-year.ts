/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";

import * as initNewYearController from "../controllers/init-new-year";
import { checkAdminMiddleware, checkUserMiddleware } from "~/middlewares/auth";

const initNewYearRouter = Router();

initNewYearRouter.use(checkUserMiddleware());
initNewYearRouter.use(checkAdminMiddleware());

initNewYearRouter.post("/", initNewYearController.initNewYear);

export default initNewYearRouter;
