import { Router } from "express";

import * as dashboardController from "../controllers/dashboard";
import { checkUserMiddleware } from "~/middlewares/auth";

const dashboardRouter = Router();

dashboardRouter.use(checkUserMiddleware());

dashboardRouter.get("/", dashboardController.dashboard);

export default dashboardRouter;
