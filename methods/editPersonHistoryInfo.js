const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const history = require("../db/history")

const editPersonHistoryInfo = new express.Router();

const jwt = require('jsonwebtoken');

editPersonHistoryInfo.post("/editPersonHistoryInfo", async (req,res) =>{
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
        const findDocument = await history.findById(data._id)
        await findDocument.updateOne(data)
        

        return res.status(200).json({
            status: 'success',
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

module.exports = editPersonHistoryInfo;