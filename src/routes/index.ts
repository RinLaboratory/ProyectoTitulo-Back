import { Router } from "express";
import areasRouter from "./areas";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import historiesRouter from "./histories";
import initNewYearRouter from "./init-new-year";
import personsRouter from "./persons";
import usersRouter from "./users";
import { authenticationMiddleware } from "~/middlewares/auth";

const appRouter = Router();
appRouter.use(authenticationMiddleware);

appRouter.use("/areas", areasRouter);
appRouter.use("/auth", authRouter);
appRouter.use("/histories", historiesRouter);
appRouter.use("/dashboard", dashboardRouter);
appRouter.use("/init-new-year", initNewYearRouter);
appRouter.use("/persons", personsRouter);
appRouter.use("/users", usersRouter);

export default appRouter;
