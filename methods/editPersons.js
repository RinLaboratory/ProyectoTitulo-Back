const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const person = require("../db/person")

const editPersons = new express.Router();

const jwt = require('jsonwebtoken');
const { protect } = require("../helpers/protect");

editPersons.post("/editPersons",protect, async (req,res) =>{
    const data = req.body

    var documents = "";

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

    try {
        documents = await person.find({rut: data.rut}, 'i')

        if(documents.length === 0) {
            return res.status(200).json({
                status: 'failed',
                msg: "La persona no existe"
            });
        }

        const filteredData = {
            ...data,
            nameE: data.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
            lastnameE: data.lastname.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        }

        const findDocument = await person.findById(data._id)
        await findDocument.updateOne(filteredData)
        

        return res.status(200).json({
            status: 'success',
        });
    }
    catch (e) {
        return res.status(200).json({
            status: 'failed',
            msg: e.toString()
        });
    }
})

module.exports = editPersons;