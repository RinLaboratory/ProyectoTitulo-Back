const express = require("express");
const bcrypt = require('bcrypt');

require("../db/config");
const usuarios = require("../db/usuarios")

const editUser = new express.Router();

const jwt = require('jsonwebtoken');
const password = require("../db/password");
const { protect } = require("../helpers/protect");

editUser.post("/editUser",protect, async (req,res) =>{
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
        if(data.password !== data.confirmPassword) {
            return res.status(200).json({
                status: 'failed',
                msg: 'Las contraseñas no coinciden'
            });
        }

        if(data.password) {
            const saltRounds = parseInt(process.env.HOW_MANY_HASHES);
        
            bcrypt.hash(data.password, saltRounds, async function(err, hash) {
                const pass = await password.findById(data.password_id)

                if (data.password.length !== 0){
                    await pass.updateOne({password: hash})
                }
            });
        }

        const filteredData = {
            username:data.username,
            usernameE:data.username.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
            email:data.email,
            password_id:data.password_id,
            rol: data.rol,
        }

        const findDocument = await usuarios.findById(data._id)
        await findDocument.updateOne(filteredData)
        

        return res.status(200).json({
            status: 'success',
            data: {
                ...filteredData,
                _id: data._id
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

module.exports = editUser;