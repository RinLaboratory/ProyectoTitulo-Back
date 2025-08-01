import {
  areasModel,
  historiesModel,
  PersonSchema,
  personsModel,
} from "~/utils/db";
import type { ServerResult, DashboardResponse } from "~/utils/validators";

export async function dashboard(): Promise<ServerResult<DashboardResponse>> {
  try {
    // Obtiene la fecha de inicio de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Establece la hora a las 00:00:00.000

    // Obtiene la fecha de inicio de mañana
    const manana = new Date();
    manana.setHours(0, 0, 0, 0);
    manana.setDate(manana.getDate() + 1); // Establece la fecha a mañana

    const atendidoDocuments = await historiesModel.find({
      timestamp: { $gte: hoy, $lt: manana },
    });

    const atendido = [];

    for (const atendidoDocument of atendidoDocuments) {
      const person = await personsModel.findById(atendidoDocument.personId);
      atendido.push(
        await PersonSchema.parseAsync({
          ...person?.toJSON(),
          _id: person?._id.toString(),
        }),
      );
    }

    const reposoDocuments = await historiesModel.find({ enviado: "" });

    const reposo = [];

    for (const reposoDocument of reposoDocuments) {
      const person = await personsModel.findById(reposoDocument.personId);
      reposo.push(
        await PersonSchema.parseAsync({
          ...person?.toJSON(),
          _id: person?._id.toString(),
        }),
      );
    }

    const retiradoDocuments = await historiesModel.find({
      timestamp: { $gte: hoy, $lt: manana },
      enviado: { $in: ["Casa", "Urgencias"] },
    });

    const retirado = [];

    for (const retiradoDocument of retiradoDocuments) {
      const person = await personsModel.findById(retiradoDocument.personId);
      retirado.push(
        await PersonSchema.parseAsync({
          ...person?.toJSON(),
          _id: person?._id.toString(),
        }),
      );
    }

    return {
      success: true,
      data: {
        atendido: atendido,
        reposo: reposo,
        retirado: retirado,
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, msg: "failed to retreive dashboard data" };
  }
}

export async function initNewYear(): Promise<ServerResult<{ status: "ok" }>> {
  try {
    const areas = await areasModel.find({ isClass: true });

    for (const area of areas) {
      const persons = await personsModel.find({
        areaId: area._id.toString(),
      });

      for (const person of persons) {
        await person.updateOne({
          ...person.toJSON(),
          areaId: area.nextId,
        });
      }
    }

    return { success: true, data: { status: "ok" } };
  } catch {
    return { success: false, msg: "failed to init new year" };
  }
}
