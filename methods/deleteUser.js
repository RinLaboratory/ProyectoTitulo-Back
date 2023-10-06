const express = require("express");
const bcrypt = require('bcrypt');

require("../db/config");
const usuarios = require("../db/usuarios")

const deleteUser = new express.Router();

const jwt = require('jsonwebtoken');
const password = require("../db/password");
const { protect } = require("../helpers/protect");

deleteUser.post("/deleteUser",protect, async (req,res) =>{
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
        user = await usuarios.findById(data._id);

        if(user.rol === "*" || usuario._id === user._id) {
            return res.status(401).json({
                status: 'failed',
                msg: "No tienes permisos"
            });
        }

        await usuarios.deleteOne({_id: data._id});
        await password.deleteOne({_id: data.password_id});

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

module.exports = deleteUser;