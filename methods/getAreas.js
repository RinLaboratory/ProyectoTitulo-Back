const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const area = require("../db/area")

const getAreas = new express.Router();

const jwt = require('jsonwebtoken');

getAreas.get("/getAreas", async (req,res) =>{
    const data = req.query
    const texto = data.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    let nameRegex = new RegExp(texto);

    var documents = "";

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
        documents = await area.find({value: nameRegex})

        return res.status(200).json({
            status: 'success',
            data: {
                data: documents,
            }
        });
    }
    catch (e) {
        return res.status(200).json({
            status: 'failed',
            msg: e.toString()
        });
    }
})

module.exports = getAreas;