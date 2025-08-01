import type { NextFunction, Request, Response } from "express";

import * as miscMethod from "../methods/miscellaneous";

export async function initNewYear(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const response = await miscMethod.initNewYear();
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}
