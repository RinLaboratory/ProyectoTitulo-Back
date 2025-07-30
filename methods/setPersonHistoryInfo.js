const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const history = require("../db/history")

const setPersonHistoryInfo = new express.Router();

const jwt = require('jsonwebtoken');

setPersonHistoryInfo.post("/setPersonHistoryInfo", async (req,res) =>{
    const data = req.body

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
            data: {
                data: []
            },
        });
    }

    try {
        var documents = new history(data)
        await documents.save() 
        

        return res.status(200).json({
            status: 'success',
        });
    }
    catch (e) {
        console.error(e)
        return res.status(200).json({
            status: 'failed',
            data: {
                data: []
            },
        });
    }
})

module.exports = setPersonHistoryInfo;