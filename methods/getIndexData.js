const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")

const getIndexData = new express.Router();

const jwt = require('jsonwebtoken');
const person = require("../db/person");
const history = require("../db/history");
const area = require("../db/area");

getIndexData.get("/getIndexData", async (req,res) =>{

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

    try {
        // Obtiene la fecha de inicio de hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Establece la hora a las 00:00:00.000

        // Obtiene la fecha de inicio de mañana
        const manana = new Date();
        manana.setHours(0, 0, 0, 0);
        manana.setDate(manana.getDate() + 1); // Establece la fecha a mañana

        var atendidoDocuments = await history.find({timestamp: { $gte: hoy, $lt: manana }});

        const atendido = []

        for (let index = 0; index < atendidoDocuments.length; index++) {
            var persons = await person.findById(atendidoDocuments[index].personId)
            atendido.push(persons)
        }

        var reposoDocuments = await history.find({enviado: ''});

        const reposo = []

        for (let index = 0; index < reposoDocuments.length; index++) {
            var persons = await person.findById(reposoDocuments[index].personId)
            reposo.push(persons)
        }

        var retiradoDocuments = await history.find({timestamp: { $gte: hoy, $lt: manana }, enviado: { $in: ['Casa', 'Urgencias']}});

        const retirado = []

        for (let index = 0; index < retiradoDocuments.length; index++) {
            var persons = await person.findById(retiradoDocuments[index].personId)
            retirado.push(persons)
        }

        var areas = await area.find({})

        return res.status(200).json({
            status: 'success',
            data: {
                data: {
                    atendido: atendido,
                    reposo: reposo,
                    retirado: retirado,
                    areas: areas,
                }
            },
        });
    } catch (error) {
        console.warn(error)
        return res.status(200).json({
            status: 'failed',
            msg: error.toString(),
        });
    }
})

module.exports = getIndexData;