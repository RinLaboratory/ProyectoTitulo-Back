const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    personId:String,
    timestamp:Date,
    sintomas:String,
    tratamiento:String,
    enviado:String,
})

historySchema.index({personId: 'text'})
module.exports = mongoose.model("history", historySchema);