const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const person = require("../db/person")

const getPersonInfo = new express.Router();

const jwt = require('jsonwebtoken');

getPersonInfo.get("/getPersonInfo", async (req,res) =>{
    const data = req.query

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
        documents = await person.find({_id: data.person});
        

        return res.status(200).json({
            status: 'success',
            data: {
                data: documents[0]
            },
        });
    }
    catch (e) {
        return res.status(200).json({
            status: 'failed',
            data: {
                data: {}
            },
        });
    }
})

module.exports = getPersonInfo;