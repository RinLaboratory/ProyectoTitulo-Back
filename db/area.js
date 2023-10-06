const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema({
    value:String,
    label:String,
    nextId:String,
    isClass:Boolean,
})

areaSchema.index({label: 'text'})
module.exports = mongoose.model("area", areaSchema);