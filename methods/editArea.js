const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const area = require("../db/area")

const editArea = new express.Router();

const jwt = require('jsonwebtoken');
const { protect } = require("../helpers/protect");

editArea.post("/editArea",protect, async (req,res) =>{
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
        documents = await area.find({value:{$eq: convertValue} })
        if(documents.length !== 0) {
            return res.status(200).json({
                status: 'failed',
                msg: "El área ya existe"
            });
        }

        if(data.nextId === data._id) {
            return res.status(200).json({
                status: 'failed',
                msg: "No puedes colocar el siguiente area sea igual que la actual"
            });
        }

        const filteredData = {
            ...data, 
            value: convertValue,
            nextId: defaultDoc[0]._id.toString() === data.nextId ? '' : data.nextId,
        }

        const findDocument = await area.findById(data._id)
        await findDocument.updateOne(filteredData)
        

        return res.status(200).json({
            status: 'success',
            data: filteredData
        });
    }
    catch (e) {
        return res.status(200).json({
            status: 'failed',
            msg: e.toString()
        });
    }
})

module.exports = editArea;