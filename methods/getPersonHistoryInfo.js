const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const history = require("../db/history")

const getPersonHistoryInfo = new express.Router();

const jwt = require('jsonwebtoken');

getPersonHistoryInfo.get("/getPersonHistoryInfo", async (req,res) =>{
    const data = req.query

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
        documents = await history.find({personId: data.personId}).sort({ timestamp: -1 });
        

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

module.exports = getPersonHistoryInfo;