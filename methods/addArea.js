const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const area = require("../db/area")

const addArea = new express.Router();

const jwt = require('jsonwebtoken');
const { protect } = require("../helpers/protect");

addArea.post("/addArea",protect, async (req,res) =>{
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
        const convertValue = data.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        var defaultDoc = await area.find({value: 'default'})
        documents = await area.find({value: convertValue})
        if(documents.length > 0) {
            return res.status(200).json({
                status: 'failed',
                msg: "El área ya existe"
            });
        }

        const filteredData = {
            ...data, 
            value: convertValue,
            nextId: defaultDoc[0]._id.toString() === data.nextId ? '' : data.nextId,
        }

        var document = new area(filteredData)
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

module.exports = addArea;