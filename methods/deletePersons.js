const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const history = require("../db/history")
const person = require("../db/person")

const deletePersons = new express.Router();

const jwt = require('jsonwebtoken');
const { protect } = require("../helpers/protect");

deletePersons.post("/deletePersons",protect, async (req,res) =>{
    const data = req.body

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
        var document = await person.findById(data._id);

        if (document) {
            await person.deleteOne({_id: data._id})
        }

        var result = await history.deleteMany({personId: data._id})

        return res.status(200).json({
            status: 'success',
        });
    }
    catch (e) {
        return res.status(200).json({
            status: 'failed',
            msg: e.toString(),
        });
    }
})

module.exports = deletePersons;