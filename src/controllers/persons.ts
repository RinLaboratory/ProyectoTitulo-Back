import type { NextFunction, Request, Response } from "express";

import * as personsMethod from "../methods/persons";

export async function getPerson(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const response = await personsMethod.getPerson({ ...req.query });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function getPersons(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const response = await personsMethod.getPersons({ ...req.query });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function addPerson(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const response = await personsMethod.addPerson({ ...req.body });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function addImportPersons(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const response = await personsMethod.addImportPersons({ ...req.files });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function editPerson(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const response = await personsMethod.editPerson({ ...req.body });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function editImportPersons(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const response = await personsMethod.editImportPersons({ ...req.files });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}

export async function deletePerson(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const response = await personsMethod.deletePerson({ ...req.body });
  if (response.success) {
    return res.status(200).json(response.data);
  } else {
    res.status(500).json({ error: response.msg });
  }
}
