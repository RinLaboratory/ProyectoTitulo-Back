const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const person = require("../db/person")

const addPersons = new express.Router();

const jwt = require('jsonwebtoken');
const { protect } = require("../helpers/protect");

addPersons.post("/addPersons",protect, async (req,res) =>{
    const data = req.body

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
        documents = await person.find({rut: data.rut})

        if(documents.length > 0) {
            return res.status(200).json({
                status: 'failed',
                msg: "La persona ya existe"
            });
        }

        const filteredData = {
            ...data,
            nameE: data.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
            lastnameE: data.lastname.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        }

        var document = new person(filteredData)
        await document.save() 
        

        return res.status(200).json({
            status: 'success',
            data: document
        });
    }
    catch (e) {
        return res.status(200).json({
            status: 'failed',
            msg: e.toString()
        });
    }
})

module.exports = addPersons;