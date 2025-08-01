/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";

import * as personsController from "../controllers/persons";
import { checkAdminMiddleware, checkUserMiddleware } from "~/middlewares/auth";

const personsRouter = Router();

personsRouter.use(checkUserMiddleware());

personsRouter.get("/:id", personsController.getPerson);
personsRouter.get("/", personsController.getPersons);

// admin
personsRouter.use(checkAdminMiddleware());
personsRouter.post("/", personsController.addPerson);
personsRouter.post("/import", personsController.addImportPersons);
personsRouter.put("/", personsController.editPerson);
personsRouter.put("/import", personsController.editImportPersons);
personsRouter.delete("/", personsController.deletePerson);

export default personsRouter;
