import { Router } from "express";

import * as historiesController from "../controllers/histories";
import { checkUserMiddleware } from "~/middlewares/auth";

const historiesRouter = Router();

historiesRouter.use(checkUserMiddleware());

historiesRouter.get("/", historiesController.getPersonHistoryInfo);
historiesRouter.post("/", historiesController.addPersonHistoryInfo);
historiesRouter.put("/", historiesController.editPersonHistoryInfo);
historiesRouter.delete("/", historiesController.deletePersonHistoryInfo);

export default historiesRouter;
