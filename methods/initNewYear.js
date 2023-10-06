const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const area = require("../db/area")
const person = require("../db/person")

const initNewYear = new express.Router();

const jwt = require('jsonwebtoken');
const { protect } = require("../helpers/protect");

initNewYear.post("/initNewYear",protect, async (req,res) =>{
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
        var areaDocs = await area.find({isClass: true})
        areaDocs.forEach( async areaElement => {
            var personDocs = await person.find({areaId: areaElement._id.toString()})
            personDocs.forEach( async personElement => {
                await personElement.updateOne({
                    ...personElement.toJSON(),
                    areaId: areaElement.nextId
                })
            })
        });

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

module.exports = initNewYear;