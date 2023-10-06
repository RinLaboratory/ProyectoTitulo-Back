const catchAsync = require('./../utils/catchAsync')

const usuarios = require("../db/usuarios")
const jwt = require('jsonwebtoken');

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
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
    
    if(usuario.rol !== '*') {
        return res.status(401).json({
            status: 'failed',
            msg: "No tienes permisos"
        });
    } else {
        next()
    }
  })