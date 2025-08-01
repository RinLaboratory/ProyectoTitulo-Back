import type { TArea, TImportPerson, TPerson } from "~/utils/db";
import {
  AreaSchema,
  areasModel,
  historiesModel,
  InsertPersonSchema,
  PersonSchema,
  personsModel,
} from "~/utils/db";
import { normalizeString } from "~/utils/normalize-string";
import type { ServerResult } from "~/utils/validators";
import {
  GetPersonsSchema,
  ImportExcelSchema,
  PersonIdSchema,
} from "~/utils/validators";
import XLSX from "xlsx";

export async function getPerson(
  input: unknown,
): Promise<ServerResult<TPerson>> {
  const { personId } = await PersonIdSchema.parseAsync(input);

  try {
    const person = await personsModel.findOne({ _id: personId });
    if (!person) {
      return { success: false, msg: "person does not exist" };
    }

    return {
      success: true,
      data: await PersonSchema.parseAsync({
        ...person.toJSON(),
        _id: person._id.toString(),
      }),
    };
  } catch {
    return { success: false, msg: "failed to query database" };
  }
}

export async function getPersons(
  input: unknown,
): Promise<ServerResult<TPerson[]>> {
  const { areaId, name } = await GetPersonsSchema.parseAsync(input);
  const normalizedName = normalizeString(name);
  const nameRegex = new RegExp(normalizedName);

  try {
    const _defaultArea = await areasModel.findOne({ value: "default" });
    const defaultArea = await AreaSchema.parseAsync({
      ..._defaultArea?.toJSON(),
      _id: _defaultArea?._id.toString(),
    });

    let queryFilters = {};
    let queryLimit = 30;

    if (areaId === defaultArea._id) {
      if (normalizedName !== "") {
        queryFilters = {
          $or: [{ nameE: nameRegex }, { lastnameE: nameRegex }],
        };
      }
    } else {
      queryFilters = {
        $or: [{ nameE: nameRegex }, { lastnameE: nameRegex }],
        $and: [{ areaId }],
      };
      queryLimit = Number.MAX_SAFE_INTEGER;
    }

    const persons = await personsModel
      .find(queryFilters)
      .limit(queryLimit)
      .then((value) =>
        value.map((person) =>
          PersonSchema.parse({
            ...person.toJSON(),
            _id: person._id.toString(),
          }),
        ),
      );

    return { success: true, data: persons };
  } catch {
    return { success: false, msg: "failed to query database" };
  }
}

export async function addPerson(
  input: unknown,
): Promise<ServerResult<TPerson>> {
  const newPerson = await InsertPersonSchema.parseAsync(input);

  try {
    const existingPerson = await personsModel.findOne({ rut: newPerson.rut });
    if (existingPerson) {
      return { success: false, msg: "person already exists" };
    }

    const filteredData = {
      ...newPerson,
      nameE: normalizeString(newPerson.name),
      lastnameE: normalizeString(newPerson.lastname),
    };

    const insertedPerson = new personsModel(filteredData);
    await insertedPerson.save();

    return {
      success: true,
      data: await PersonSchema.parseAsync({
        ...insertedPerson.toJSON(),
        _id: insertedPerson._id.toString(),
      }),
    };
  } catch {
    return { success: false, msg: "failed to insert person into database" };
  }
}

export async function addImportPersons(
  input: unknown,
): Promise<ServerResult<{ status: "ok" }>> {
  const { file } = await ImportExcelSchema.parseAsync(input);

  try {
    const workbook = XLSX.read(file, { type: "buffer" });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) {
      return { success: false, msg: "excel does not have valid sheets" };
    }

    const firstPage = workbook.Sheets[firstSheet];
    if (!firstPage) {
      return { success: false, msg: "excel does not have valid pages" };
    }

    const excelDataRecord = XLSX.utils.sheet_to_json(
      firstPage,
    ) as unknown as TImportPerson[];
    const newPersons = [];

    for (const excelRow of excelDataRecord) {
      if (!excelRow["curso/area"]) {
        return { success: false, msg: "area value is not set" };
      }

      const normalizedAreaValue = normalizeString(excelRow["curso/area"]);
      const valueRegex = new RegExp(normalizedAreaValue);
      const area = await areasModel
        .findOne({ value: valueRegex })
        .then((value) =>
          value
            ? AreaSchema.parse({ ...value.toJSON(), _id: value._id.toString() })
            : null,
        );
      if (!area) {
        return {
          success: false,
          msg: `this area does not exist ${excelRow["curso/area"]}`,
        };
      }

      const person = await personsModel.findOne({ rut: excelRow.rut });
      if (person) {
        return {
          success: false,
          msg: `this person is already on the system ${excelRow.rut}`,
        };
      }

      const organizedData = {
        rut: excelRow.rut,
        name: excelRow.nombres,
        nameE: normalizeString(excelRow.nombres),
        lastname: excelRow.apellidos,
        lastnameE: normalizeString(excelRow.apellidos),
        phone: `+${excelRow["telefono casa"]}`,
        insurance: excelRow["seguro medico"],
        address: excelRow["direccion casa"],
        bloodType: excelRow["grupo sanguineo"],
        areaId: area._id.toString(),
        Rname: excelRow["nombres apoderado"],
        Rlastname: excelRow["apellido apoderado"],
        Rphone: `+${excelRow["telefono apoderado"]}`,
        EmergencyContact: `+${excelRow["contacto de emergencia"]}`,
      };

      newPersons.push(organizedData);
    }

    await personsModel.insertMany(newPersons);

    return { success: true, data: { status: "ok" } };
  } catch {
    return { success: false, msg: "failed to import excel into database" };
  }
}

export async function editPerson(
  input: unknown,
): Promise<ServerResult<TPerson>> {
  const updatedPerson = await PersonSchema.parseAsync(input);
  try {
    const existingPerson = await personsModel.findOne(
      { rut: updatedPerson.rut },
      "i",
    );

    if (!existingPerson) {
      return { success: false, msg: "person does not exist" };
    }

    const filteredData = {
      ...(await AreaSchema.parseAsync({
        ...existingPerson.toJSON(),
        _id: existingPerson._id.toString(),
      })),
      ...updatedPerson,
      nameE: normalizeString(updatedPerson.name),
      lastnameE: normalizeString(updatedPerson.lastname),
    };

    await existingPerson.updateOne(filteredData);

    return { success: true, data: filteredData };
  } catch {
    return { success: false, msg: "failed to update person" };
  }
}

export async function editImportPersons(
  input: unknown,
): Promise<ServerResult<{ status: "ok" }>> {
  const { file } = await ImportExcelSchema.parseAsync(input);

  try {
    const workbook = XLSX.read(file, { type: "buffer" });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) {
      return { success: false, msg: "excel does not have valid sheets" };
    }

    const firstPage = workbook.Sheets[firstSheet];
    if (!firstPage) {
      return { success: false, msg: "excel does not have valid pages" };
    }

    const excelDataRecord = XLSX.utils.sheet_to_json(
      firstPage,
    ) as unknown as TImportPerson[];
    const updatedPersons = [];

    // Haz algo con 'datos', que contiene los datos del archivo XLSX
    for (const excelRow of excelDataRecord) {
      let markedArea: TArea | undefined = undefined;
      if (excelRow["curso/area"]) {
        const normalizedAreaValue = normalizeString(excelRow["curso/area"]);
        const valueRegex = new RegExp(normalizedAreaValue);
        const area = await areasModel
          .findOne({ value: valueRegex })
          .then((value) =>
            value
              ? AreaSchema.parse({
                  ...value.toJSON(),
                  _id: value._id.toString(),
                })
              : null,
          );
        if (!area) {
          return {
            success: false,
            msg: `this area does not exist ${excelRow["curso/area"]}`,
          };
        }
        markedArea = area;
      }

      const person = await personsModel.findOne({ rut: excelRow.rut });
      if (!person) {
        return {
          success: false,
          msg: `this person does not exist ${excelRow.rut}`,
        };
      }
      const existingPerson = await PersonSchema.parseAsync({
        ...person.toJSON(),
        _id: person._id.toString(),
      });

      const organizedData: TPerson = {
        _id: existingPerson._id.toString(),
        rut: excelRow.rut,
        name: excelRow.nombres ? excelRow.nombres : existingPerson.name,
        nameE: excelRow.nombres
          ? excelRow.nombres
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
          : existingPerson.nameE,
        lastname: excelRow.apellidos
          ? excelRow.apellidos
          : existingPerson.lastname,
        lastnameE: excelRow.apellidos
          ? excelRow.apellidos
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
          : existingPerson.lastnameE,
        phone: excelRow["telefono casa"]
          ? `+${excelRow["telefono casa"]}`
          : existingPerson.phone,
        insurance: excelRow["seguro medico"]
          ? excelRow["seguro medico"]
          : existingPerson.insurance,
        address: excelRow["direccion casa"]
          ? excelRow["direccion casa"]
          : existingPerson.address,
        bloodType: excelRow["grupo sanguineo"]
          ? excelRow["grupo sanguineo"]
          : existingPerson.bloodType,
        areaId: markedArea ? markedArea._id.toString() : existingPerson.areaId,
        Rname: excelRow["nombres apoderado"]
          ? excelRow["nombres apoderado"]
          : existingPerson.Rname,
        Rlastname: excelRow["apellido apoderado"]
          ? excelRow["apellido apoderado"]
          : existingPerson.Rlastname,
        Rphone: excelRow["telefono apoderado"]
          ? `+${excelRow["telefono apoderado"]}`
          : existingPerson.Rphone,
        EmergencyContact: excelRow["contacto de emergencia"]
          ? `+${excelRow["contacto de emergencia"]}`
          : existingPerson.EmergencyContact,
      };

      updatedPersons.push(organizedData);
    }

    for (const person of updatedPersons) {
      const existingPerson = await personsModel.findById(person._id);
      if (!existingPerson) {
        return { success: false, msg: "this person does not exist" };
      }
      await existingPerson.updateOne(person);
    }

    return { success: true, data: { status: "ok" } };
  } catch {
    return { success: false, msg: "failed to import excel into database" };
  }
}

export async function deletePerson(
  input: unknown,
): Promise<ServerResult<TPerson>> {
  const markedPerson = await PersonSchema.parseAsync(input);
  try {
    const existingPerson = await personsModel.findById(markedPerson._id);

    if (!existingPerson) {
      return { success: false, msg: "this person does not exist" };
    }

    await personsModel.deleteOne({ _id: markedPerson._id });

    await historiesModel.deleteMany({
      personId: markedPerson._id,
    });

    return { success: true, data: markedPerson };
  } catch {
    return { success: false, msg: "failed to delete person from database" };
  }
}
