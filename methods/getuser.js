const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")

const getUser = new express.Router();

const jwt = require('jsonwebtoken');
const { protect } = require("../helpers/protect");

getUser.get("/getusers",protect, async (req,res) =>{
    const data = req.query;
    const texto = data.username.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    let nameRegex = new RegExp(texto);
    var users = "";

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

    users = await usuarios.find({$or: [{usernameE: nameRegex}, {email: nameRegex}]});

    return res.status(200).json({
        status:  'success',
        data: {
            data: users
        },
    });
})

module.exports = getUser;