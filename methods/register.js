const bcrypt = require('bcrypt');
const express = require("express");
require('dotenv').config()
require("../db/config");
const usuarios = require("../db/usuarios")
const password = require('../db/password');

const register = new express.Router();

const jwt = require('jsonwebtoken');
const { protect } = require('../helpers/protect');

register.post("/register",protect, async (req,res) =>{
    const userData = req.body;
    const saltRounds = parseInt(process.env.HOW_MANY_HASHES);
    
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

    // el correo no puede tener espacios entremedio, así que se elimininan
    const email = userData.email;
    var checkEmail = email.split(' ').join('');
    var users = "";
    
    if (checkEmail.length !== 0 && userData.password.length != 0)
    {
        users = await usuarios.find({email: checkEmail});
        if (users.length > 0) {
            return res.status(200).json({
                status: false,
                msg: "El correo ya está inscrito"
            });
        } else {
            bcrypt.hash(userData.password, saltRounds, async function(err, hash) {
                
                let pass = new password({password: hash})
                await pass.save();

                let b_username = userData.username.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

                let hashedUserPassword = {
                    username: userData.username,
                    usernameE: b_username,
                    rol: 'user',
                    email: checkEmail,
                    password_id: pass._id.toString()
                }

                let user = new usuarios(hashedUserPassword);
                await user.save();
                return res.status(200).json({
                    status: 'success',
                    data: user
                });
            });
        }
        
    } else {
        return res.status(200).json({
            status: 'failed',
            msg: "Correo y/o contraseña no son válidos"
        });
    }
    
})

module.exports = register;