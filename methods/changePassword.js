const express = require("express");
const bcrypt = require('bcrypt');

require("../db/config");
const usuarios = require("../db/usuarios")
const password = require("../db/password")

const changePassword = new express.Router();

const jwt = require('jsonwebtoken');

changePassword.post("/changePassword", async (req,res) =>{
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
        const saltRounds = parseInt(process.env.HOW_MANY_HASHES);
        
        bcrypt.hash(data.password, saltRounds, async function(err, hash) {
            const pass = await password.findById(data.passwordId)

            if (data.password.length !== 0){
                await pass.updateOne({password: hash})

                return res.status(200).json({
                    status: 'success',
                });
            }
        });
    }
    catch (e) {
        return res.status(200).json({
            status: 'failed',
            msg: e.toString(),
        });
    }
})

module.exports = changePassword;