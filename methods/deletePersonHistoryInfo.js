const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const history = require("../db/history")

const deletePersonHistoryInfo = new express.Router();

const jwt = require('jsonwebtoken');

deletePersonHistoryInfo.post("/deletePersonHistoryInfo", async (req,res) =>{
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
            msg: "No tienes permisos"
        });
    }

    try {
        await history.deleteOne({_id: data._id});
        

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

module.exports = deletePersonHistoryInfo;