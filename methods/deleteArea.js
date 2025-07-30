const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")
const area = require("../db/area")
const person = require("../db/person")

const deleteArea = new express.Router();

const jwt = require('jsonwebtoken');
const { protect } = require("../helpers/protect");

deleteArea.post("/deleteArea",protect, async (req,res) =>{
    const data = req.body

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
        documents = await area.findById(data._id)
        if(!documents) {
            return res.status(200).json({
                status: 'failed',
                msg: "El área no existe"
            });
        }

        var checkpersons = await person.find({areaId: data._id})
        if(checkpersons.length > 0) {
            return res.status(200).json({
                status: 'failed',
                msg: `El área todavía tiene ${checkpersons.length} personas inscritas`
            });
        }

        await area.deleteOne({_id: data._id});
        

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

module.exports = deleteArea;