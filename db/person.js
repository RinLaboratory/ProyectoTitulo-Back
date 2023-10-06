const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
    rut:String,
    name:String,
    nameE:String,
    lastname:String,
    lastnameE:String,
    phone:String,
    insurance:String,
    address:String,
    bloodType:String,
    areaId:String,
    Rname:String,
    Rlastname:String,
    Rphone:String,
    EmergencyContact:String,
})

personSchema.index({nameE: 'text'})
module.exports = mongoose.model("person", personSchema);