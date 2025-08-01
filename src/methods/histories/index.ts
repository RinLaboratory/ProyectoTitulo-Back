import {
  historiesModel,
  HistorySchema,
  InsertHistorySchema,
  THistory,
} from "~/utils/db";
import {
  PersonIdSchema,
  idSchema,
  ServerResult,
} from "~/utils/validators";

export async function getPersonHistoryInfo(
  input: unknown
): Promise<ServerResult<THistory[]>> {
  const { personId } = await PersonIdSchema.parseAsync(input);
  try {
    const histories = await historiesModel
      .find({ personId: personId })
      .sort({ timestamp: -1 })
      .then((value) =>
        value.map((history) =>
          HistorySchema.parse({ ...history, _id: history._id.toString() })
        )
      );

    return { success: true, data: histories };
  } catch (e) {
    return { success: false, msg: "failed to query histories" };
  }
}

export async function addPersonHistoryInfo(
  input: unknown
): Promise<ServerResult<THistory>> {
  const newHistory = await InsertHistorySchema.parseAsync(input);

  try {
    const insertedHistory = new historiesModel(newHistory);
    await insertedHistory.save();

    return {
      success: true,
      data: await HistorySchema.parseAsync({
        ...insertedHistory,
        _id: insertedHistory._id.toString(),
      }),
    };
  } catch (e) {
    console.error(e);
    return { success: false, msg: "failed to insert history into database" };
  }
}

export async function editPersonHistoryInfo(
  input: unknown
): Promise<ServerResult<THistory>> {
  const updatedHistory = await HistorySchema.parseAsync(input);

  try {
    const existingHistory = await historiesModel.findById(updatedHistory._id);
    if (!existingHistory) {
      return { success: false, msg: "history does not exist" };
    }

    await existingHistory.updateOne(updatedHistory);

    return { success: true, data: updatedHistory };
  } catch (e) {
    console.error(e);
    return { success: false, msg: "failed to update history" };
  }
}

export async function deletePersonHistoryInfo(
  input: unknown
): Promise<ServerResult<THistory>> {
  const { _id } = await idSchema.parseAsync(input);

  try {
    const existingHistory = await historiesModel.findById(_id);
    if (!existingHistory) {
      return { success: false, msg: "history does not exist" };
    }

    await historiesModel.deleteOne({ _id });

    return {
      success: true,
      data: await HistorySchema.parseAsync({
        ...existingHistory,
        _id: existingHistory._id.toString(),
      }),
    };
  } catch (e) {
    return { success: false, msg: "failed to delete history from database" };
  }
}
