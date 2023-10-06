const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const person = require("../db/person")
const area = require("../db/area")

const getPersons = new express.Router();

const jwt = require('jsonwebtoken');

getPersons.get("/getPersons", async (req,res) =>{
    const data = req.query

    const texto = req.query.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

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
        var defaultDoc = await area.find({value: 'default'})
        if ((data.area === 'default' || data.area === defaultDoc[0]._id.toString())) {
            if (texto === '') {
                documents = await person.find({}).limit(30);
            } else {
                documents = await person.find({$or: [{nameE: nameRegex}, {lastnameE: nameRegex}]}).limit(30);
            }
        }
        else {
            documents = await person.find({$or: [{nameE: nameRegex}, {lastnameE: nameRegex}], $and: [{areaId: data.area}]});
        }
        
        return res.status(200).json({
            status: 'success',
            data: {
                data: documents
            },
        });
    }
    catch (e) {
        return res.status(200).json({
            status: 'failed',
            data: {
                data: []
            },
        });
    }
})

module.exports = getPersons;