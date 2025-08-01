import type { NextFunction, Request, Response } from "express";

import * as historiesMethod from "../methods/histories";

export async function getPersonHistoryInfo(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const response = await historiesMethod.getPersonHistoryInfo({
    ...req.query,
  });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function addPersonHistoryInfo(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const response = await historiesMethod.addPersonHistoryInfo({
    ...req.body,
  });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function editPersonHistoryInfo(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const response = await historiesMethod.editPersonHistoryInfo({
    ...req.body,
  });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function deletePersonHistoryInfo(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const response = await historiesMethod.deletePersonHistoryInfo({
    ...req.body,
  });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}
