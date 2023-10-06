const express = require("express");

require("../db/config");
const usuarios = require("../db/usuarios")

const getCurrentUser = new express.Router();

const jwt = require('jsonwebtoken');

getCurrentUser.get("/getCurrentUser", async (req,res) =>{

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

    return res.status(200).json({
        status: 'success',
        data: {
            data: usuario
        },
    });
})

module.exports = getCurrentUser;