const express = require("express");

require("../db/config");

const usuarios = require("../db/usuarios")
const person = require("../db/person")
const area = require("../db/area")

const XLSX = require("xlsx")

const addImportPersons = new express.Router();

const jwt = require('jsonwebtoken');
const { protect } = require("../helpers/protect");

addImportPersons.post("/addImportPersons",protect, async (req,res) =>{

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
            var documents = [];
            var persons = []
            let nameRegex = null
            var texto = null
            
            if(element['curso/area']) {
                texto = element['curso/area'].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                nameRegex = new RegExp(texto);
                documents = await area.find({value: nameRegex})
            }

            persons = await person.find({rut: element['rut']})
            if(documents.length === 0) {
                error = {
                    status: 'failed',
                    area: `El area "${texto}" no existe.`,
                    index: index+1
                }
                break
            }
            if(persons.length > 0) {
                error = {
                    status: 'failed',
                    area: `La persona con el rut "${element['rut']}" ya está ingresada en el sistema.`,
                    index: index+1
                }
                break
            }

            organizedData = {
                rut:element['rut'],
                name:element['nombres'],
                nameE:element['nombres'].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                lastname:element['apellidos'],
                lastnameE:element['apellidos'].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                phone:`+${element['telefono casa']}`,
                insurance:element['seguro medico'],
                address:element['direccion casa'],
                bloodType:element['grupo sanguineo'],
                areaId:documents[0]._id.toString(),
                Rname:element['nombres apoderado'],
                Rlastname:element['apellido apoderado'],
                Rphone:`+${element['telefono apoderado']}`,
                EmergencyContact:`+${element['contacto de emergencia']}`,
            }

            personsDocuments.push(organizedData)
        }

        person.insertMany(personsDocuments)

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

module.exports = addImportPersons;