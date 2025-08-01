import {
  AreaSchema,
  areasModel,
  historiesModel,
  PersonSchema,
  personsModel,
  TArea,
  TPerson,
} from "~/utils/db";
import { ServerResult, DashboardResponse } from "~/utils/validators";

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

    for (let index = 0; index < atendidoDocuments.length; index++) {
      const person = await personsModel.findById(
        atendidoDocuments[index]?.personId
      );
      atendido.push(
        await PersonSchema.parseAsync({
          ...person?.toJSON(),
          _id: person?._id.toString(),
        })
      );
    }

    const reposoDocuments = await historiesModel.find({ enviado: "" });

    const reposo = [];

    for (let index = 0; index < reposoDocuments.length; index++) {
      const person = await personsModel.findById(
        reposoDocuments[index]?.personId
      );
      reposo.push(
        await PersonSchema.parseAsync({
          ...person?.toJSON(),
          _id: person?._id.toString(),
        })
      );
    }

    const retiradoDocuments = await historiesModel.find({
      timestamp: { $gte: hoy, $lt: manana },
      enviado: { $in: ["Casa", "Urgencias"] },
    });

    const retirado = [];

    for (let index = 0; index < retiradoDocuments.length; index++) {
      const person = await personsModel.findById(
        retiradoDocuments[index]?.personId
      );
      retirado.push(
        await PersonSchema.parseAsync({
          ...person?.toJSON(),
          _id: person?._id.toString(),
        })
      );
    }

    const areas = await areasModel
      .find({})
      .then((value) =>
        value.map((area) =>
          AreaSchema.parse({ ...area.toJSON(), _id: area._id.toString() })
        )
      );

    return {
      success: true,
      data: {
        atendido: atendido,
        reposo: reposo,
        retirado: retirado,
        areas: areas,
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
  } catch (e) {
    return { success: false, msg: "failed to init new year" };
  }
}
