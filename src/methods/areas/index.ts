import type { TArea } from "~/utils/db";
import {
  AreaSchema,
  areasModel,
  InsertAreaSchema,
  personsModel,
} from "~/utils/db";
import { normalizeString } from "~/utils/normalize-string";
import type { ServerResult } from "~/utils/validators";
import { GetAreasSchema } from "~/utils/validators";

export async function getAreas(input: unknown): Promise<ServerResult<TArea[]>> {
  const { name } = await GetAreasSchema.parseAsync(input);
  const normalizedName = normalizeString(name);
  const nameRegex = new RegExp(normalizedName);

  try {
    const areas = await areasModel.find({ value: nameRegex }).then((value) => {
      return value.map((area) => {
        return AreaSchema.parse({
          ...area.toJSON(),
          _id: area._id.toString(),
        });
      });
    });

    return { success: true, data: areas };
  } catch {
    return { success: false, msg: "failed to fetch database query" };
  }
}

// admin
export async function addArea(input: unknown): Promise<ServerResult<TArea>> {
  const newArea = await InsertAreaSchema.parseAsync(input);

  try {
    const convertValue = normalizeString(newArea.label);

    const _defaultArea = await areasModel.findOne({ value: "default" });
    const existingArea = await areasModel.findOne({ value: convertValue });

    if (existingArea) {
      return { success: false, msg: "area already exists" };
    }

    const defaultArea = await AreaSchema.parseAsync({
      ..._defaultArea?.toJSON(),
      _id: _defaultArea?._id.toString(),
    });

    const filteredData = {
      ...newArea,
      value: convertValue,
      nextId: defaultArea._id === newArea.nextId ? "" : newArea.nextId,
    };

    const insertedArea = new areasModel(filteredData);
    await insertedArea.save();

    return {
      success: true,
      data: await AreaSchema.parseAsync({
        ...insertedArea.toJSON(),
        _id: insertedArea._id.toString(),
      }),
    };
  } catch {
    return { success: false, msg: "failed to insert new area" };
  }
}

// admin
export async function editArea(input: unknown): Promise<ServerResult<TArea>> {
  const editedArea = await AreaSchema.parseAsync(input);

  try {
    const convertValue = normalizeString(editedArea.label);

    const _defaultArea = await areasModel.findOne({ value: "default" });
    const defaultArea = await AreaSchema.parseAsync({
      ..._defaultArea?.toJSON(),
      _id: _defaultArea?._id.toString(),
    });

    const existingArea = await areasModel.findOne({
      value: { $eq: convertValue },
    });

    if (existingArea && existingArea._id.toString() !== editedArea._id) {
      return { success: false, msg: "there is already an area with that name" };
    }

    if (editedArea.nextId === editedArea._id) {
      return {
        success: false,
        msg: "next area can not be equals to current area",
      };
    }

    const filteredData = {
      ...editedArea,
      value: convertValue,
      nextId:
        defaultArea._id.toString() === editedArea.nextId
          ? ""
          : editedArea.nextId,
    };

    const areaToUpdate = await areasModel.findById(editedArea._id);
    if (!areaToUpdate) {
      return {
        success: false,
        msg: "failed to find the area that is being updated",
      };
    }

    await areaToUpdate.updateOne(filteredData);

    return { success: true, data: filteredData };
  } catch {
    return { success: false, msg: "failed to update area" };
  }
}

// admin
export async function deleteArea(input: unknown): Promise<ServerResult<TArea>> {
  const markedArea = await AreaSchema.parseAsync(input);

  try {
    const existingArea = await areasModel.findById(markedArea._id);
    if (!existingArea) {
      return { success: false, msg: "area does not exist" };
    }

    const checkpersons = await personsModel.find({ areaId: markedArea._id });
    if (checkpersons.length > 0) {
      return {
        success: false,
        msg: `this area still has ${checkpersons.length} people inside`,
      };
    }

    await areasModel.deleteOne({ _id: markedArea._id });

    return { success: true, data: markedArea };
  } catch {
    return {
      success: false,
      msg: "failed to delete area",
    };
  }
}
