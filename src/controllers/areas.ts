import type { NextFunction, Request, Response } from "express";

import * as areasMethod from "../methods/areas";

export async function getAreas(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const response = await areasMethod.getAreas({
    ...req.query,
  });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function addArea(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const response = await areasMethod.addArea({
    ...req.body,
  });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function editArea(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const response = await areasMethod.editArea({
    ...req.body,
  });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function deleteArea(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const response = await areasMethod.deleteArea({
    ...req.body,
  });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}
