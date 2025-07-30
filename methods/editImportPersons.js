const express = require("express");

require("../db/config");

const usuarios = require("../db/usuarios")
const person = require("../db/person")
const area = require("../db/area")

const XLSX = require("xlsx")

const editImportPersons = new express.Router();

const jwt = require('jsonwebtoken');
const { protect } = require("../helpers/protect");

editImportPersons.post("/editImportPersons",protect, async (req,res) =>{

    req.headers.cookie = req.headers.cookie
    ?.split(";")
    .filter((c) => !c.trim().startsWith("__next_hmr_refresh_hash__="))
    .join(";");

    const [name, token] = req.header('cookie').trim().split('=');
    const {uuid} = jwt.verify(
        token,
        process.env.SECRET_JWT_SEED
    );
    const usuario = await usuarios.findById(uuid)

    if (!usuario) {
        return res.status(401).json({
            status: 'failed',
            msg: "No tienes permisos"
        });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            status: 'failed',
            msg: 'No se subió ningún archivo.',
        });
    }
    
    const archivo = req.files.archivo;

    try {
        const workbook = XLSX.read(archivo.data, { type: 'buffer' });
        const primeraHoja = workbook.Sheets[workbook.SheetNames[0]];
        const datos = XLSX.utils.sheet_to_json(primeraHoja);

        const personsDocuments = []

        var error = {
            status: 'success',
        }

        // Haz algo con 'datos', que contiene los datos del archivo XLSX
        for (let index = 0; index < datos.length; index++) {
            const element = datos[index];
            let nameRegex = null;
            var documents = [];
            var persons = []

            if (element['curso/area']) {
                const texto = element['curso/area'].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                nameRegex = new RegExp(texto)
                
                documents = await area.find({value: nameRegex})

                if(documents.length === 0) {
                    error = {
                        status: 'failed',
                        area: `El area "${texto}" no existe.`,
                        index: index+1
                    }
                    break
                }
            }

            
            persons = await person.find({rut: element['rut']})
            if(persons.length === 0) {
                error = {
                    status: 'failed',
                    area: `La persona con el rut "${element['rut']}" no está ingresada en el sistema.`,
                    index: index+1
                }
                break
            }

            organizedData = {
                _id:persons[0]._id.toString(),
                rut:element['rut'],
                name:element['nombres'] ? element['nombres'] : persons[0].name,
                nameE:element['nombres'] ? element['nombres'].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : persons[0].nameE,
                lastname:element['apellidos'] ? element['apellidos'] : persons[0].lastname,
                lastnameE:element['apellidos'] ? element['apellidos'].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : persons[0].lastnameE,
                phone:element['telefono casa'] ? `+${element['telefono casa']}` : persons[0].phone,
                insurance:element['seguro medico'] ? element['seguro medico'] : persons[0].insurance,
                address:element['direccion casa'] ? element['direccion casa'] : persons[0].address,
                bloodType:element['grupo sanguineo'] ? element['grupo sanguineo'] : persons[0].bloodType,
                areaId:element['areaId'] ? documents[0]._id.toString() : persons[0].areaId,
                Rname:element['nombres apoderado'] ? element['nombres apoderado'] : persons[0].Rname,
                Rlastname:element['apellido apoderado'] ? element['apellido apoderado'] : persons[0].Rlastname,
                Rphone:element['telefono apoderado'] ? `+${element['telefono apoderado']}` : persons[0].Rphone,
                EmergencyContact:element['contacto de emergencia'] ? `+${element['contacto de emergencia']}` : persons[0].EmergencyContact,
            }

            personsDocuments.push(organizedData)
        }

        personsDocuments.forEach(async element => {
            const findDocument = await person.findById(element._id)
            await findDocument.updateOne(element)
        });

        if(error.status === 'failed') {
            return res.status(200).json({
                status: 'failed',
                msg: `${error.area} Linea ${error.index}`
            });
        } else {
            return res.status(200).json({
                status: 'success',
                linea: `${datos.length}`
            });
        }

      } catch (error) {
        return res.status(500).json({
            status: 'failed',
            msg: `${error}`
        });
      }
})

module.exports = editImportPersons;