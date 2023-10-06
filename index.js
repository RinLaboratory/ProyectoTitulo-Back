const express = require("express");
const cors = require("cors");
const mongoSanitize = require('express-mongo-sanitize')
const fileupload = require("express-fileupload")
const hpp = require('hpp')
const helmet = require('helmet');
const crypto = require('node:crypto');

require('dotenv').config()

const app = express();

app.use(fileupload())

app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb'}));

app.use(express.json());

// 1) GLOBAL MIDDLEWARES
// Implement CORS
const whitelist = process.env.URL_FRONTEND.split(',').map(el => el.trim())
const corsOptions = {
  origin: whitelist,
  credentials: true,
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
// Set security HTTP headers
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64')
  next()
})
app.use(helmet())
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
    },
  }),
)
app.set('trust proxy', 1)
app.use(mongoSanitize({ allowDots: true }))
app.use(hpp({ whitelist: ['name'] }))

// Consultas usuarios normales

// login
app.use(require("./methods/login"));
app.use(require("./methods/renewJWT"));

app.use(require("./methods/changePassword"));

// index
app.use(require("./methods/getIndexData"));

app.use(require("./methods/getcurrentuser"));

// get datos de personas
app.use(require("./methods/getpersons"));
app.use(require("./methods/getPersonInfo"));
app.use(require("./methods/getPersonHistoryInfo"));
app.use(require("./methods/setPersonHistoryInfo"));
app.use(require("./methods/editPersonHistoryInfo"));
app.use(require("./methods/deletePersonHistoryInfo"));

app.use(require("./methods/getAreas"));


// Consultas usuarios Administrador

// consulta de usuarios
app.use(require("./methods/getuser"));
app.use(require("./methods/register"));
app.use(require("./methods/editUser"));
app.use(require("./methods/deleteUser"));

// consulta de personas
app.use(require("./methods/addPersons"));
app.use(require("./methods/addImportPersons"));
app.use(require("./methods/editPersons"));
app.use(require("./methods/editImportPersons"));
app.use(require("./methods/deletePersons"));

// consulta de areas
app.use(require("./methods/addArea"));
app.use(require("./methods/deleteArea"));
app.use(require("./methods/editArea"));

// consulta de inicio de año nuevo
app.use(require("./methods/initNewYear"));

app.all('*', (req, res) => {
  return res.status(404).json({
    status: 'failed',
    msg: "Not found",
    data: {
      data: []
    }
});
})

console.log("app is online at port "+process.env.SERVER_PORT)
app.listen(process.env.SERVER_PORT);