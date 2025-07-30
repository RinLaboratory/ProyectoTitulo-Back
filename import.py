from random import randint
from pymongo import MongoClient

import unicodedata

def removethings(text):
    normalized_text = unicodedata.normalize('NFD', str(text))
    text_without_diacritics = ''.join([char for char in normalized_text if not unicodedata.combining(char)])
    lowercase_text = text_without_diacritics.lower()
    return lowercase_text

def genRut():
    first = randint(10000000, 99999999)
    second = randint(0, 10)
    rut = ''
    if second == 10:
        second = 'k'

    rut = str(first) + '-' + str(second)
    return rut
       
def genPhone():
    first = randint(10000000, 99999999)
    second = '+569'
    phone = str(second) + str(first)
    return phone
        
def generateAreas(y_value, z_value, inserted):
    cursos = ["IV°", "III°", "II°", "I°", "8°", "7°", "6°", "5°", "4°", "3°", "2°", "1°", "Kinder", "Pre-Kinder", "PlayGroup"]
    letras = ["A", "B", "C"]

    ThisId = ''

    if inserted != '':
        ThisId = inserted.inserted_id

    return {
        'value': removethings(cursos[z_value] + " " + letras[y_value]),
        'label': cursos[z_value] + " " + letras[y_value],
        'nextId': str(ThisId),
        'isClass': True,
    }


def generate(ThisId):

    nombres = ["Isabella","Sofía","Agustina","Emilia","Josefa","Isidora","Emma","Trinidad","Florencia","Julieta","Maite","María","Amanda","Antonella","Martina","Valentina","Catalina","Leonor","Renata","Mia","Mateo","Agustín","Santiago","Tomás","Benjamín","Lucas","Gaspar","Alonso","Vicente","Maximiliano","Joaquín","Matías","Martín","José","Luciano","Facundo","Julián","Gabriel","Máximo","Juan"]
    apellidos = ["Gonzalez","Muñoz","Rojas","Diaz","Perez","Soto","Contreras","Silva","Martinez","Sepulveda","Morales","Rodriguez","Lopez","Araya","Fuentes","Hernandez","Torres","Espinoza","Flores","Castillo","Valenzuela","Ramirez","Reyes","Gutierrez","Castro","Vargas","Alvarez","Vasquez","Tapia","Fernandez","Sanchez","Cortes","Gomez","Herrera","Carrasco","Nuñez","Miranda","Jara","Vergara","Rivera","Figueroa","Garcia","Bravo","Riquelme","Vera","Vega","Molina","Campos","Sandoval","Olivares","Orellana","Zuñiga","Ortiz","Gallardo","Alarcon","Garrido","Salazar","Pizarro","Aguilera","Saavedra","Romero","Guzman","Henriquez","Navarro","Peña","Aravena","Godoy","Caceres","Parra","Leiva","Escobar","Yañez","Valdes","Salinas","Vidal","Jimenez","Lagos","Ruiz","Cardenas","Bustos","Medina","Maldonado","Pino","Moreno","Carvajal","Palma","Sanhueza","Poblete","Navarrete","Saez","Toro","Donoso","Ortega","Venegas","Bustamante","Alvarado","Acevedo","Farias","Acuña","Guerrero"]

    nombres_value1 = randint(0, 39)
    nombres_value2 = randint(0, 39)
    nombres_value3 = randint(20, 39)

    apellidos_value1 = randint(0, 99)
    apellidos_value2 = randint(0, 99)

    return {
        'rut': genRut(),
        'name': nombres[nombres_value1],
        'nameE':removethings(nombres[nombres_value1]),
        'lastname': apellidos[apellidos_value1],
        'lastnameE': removethings(apellidos[apellidos_value1]),
        'phone': genPhone(),
        'insurance': 'Hospital' + ' ' + nombres[nombres_value3] + ' ' + apellidos[apellidos_value2],
        'address': 'algún lugar del mundo',
        'bloodType': 'unknown',
        'areaId': str(ThisId),
        'Rname': nombres[nombres_value2],
        'Rlastname': apellidos[apellidos_value1],
        'Rphone': genPhone(),
        'EmergencyContact': genPhone(),
    }

def createSuperUser():
    dbname = get_database()

    defaultpassword = {
        "password": "$2b$10$JnA6k4nBCsJ/TiU1Q8hjDevYA6b3OKDRuk1c2BzJJqe1y54v.KueW",
    }
    password = dbname["passwords"].insert_one(defaultpassword)
    defaultuser = {
        "username": "Administrador",
        "usernameE": "administrador",
        "email": "123@123.com",
        "password_id": password.inserted_id,
        "rol": "*",
    }
    user = dbname["usuarios"].insert_one(defaultuser)
    print("Se ha creado el superusuario en la id: "+str(user.inserted_id))


def get_database():
 
   # Provide the mongodb atlas url to connect python to mongodb using pymongo
   CONNECTION_STRING = "mongodb://localhost:27017" #"mongodb+srv://<mongo_external_url>"
 
   # Create a connection using MongoClient. You can import MongoClient or use pymongo.MongoClient
   client = MongoClient(CONNECTION_STRING)
 
   # Create the database for our example (we will use the same database throughout the tutorial
   mydb =  client['ProyectoTitulo'] #client['iglesia']

   return mydb


def populateDB():
    y_how_many = 3
    y_value = 0
    dbname = get_database()

    inserted = ''

    dbname["areas"].insert_one({
        "value": "default",
        "label": "Ninguno",
        "nextId": ""
    })
    

    backupInserted = dbname["areas"].insert_one({
        'value': removethings('Ex-Alumnos'),
        'label': 'Ex-Alumnos',
        'nextId': '',
        'isClass': False,
    })

    while(y_value < y_how_many):
        inserted = backupInserted
        z_value = 0
        z_how_many = 15
        while (z_value < z_how_many):
            x = generateAreas(y_value, z_value, inserted)
            inserted = dbname["areas"].insert_one(x)
            z_value = z_value + 1
        y_value = y_value + 1

    areas = dbname["areas"].find({})
    
    for document in areas:
        how_many = 30
        x_value = 0
        ThisId = document['_id']

        while(x_value < how_many):
            x = generate(ThisId)
            dbname["people"].insert_one(x)
            x_value = x_value + 1

    
    print("done!")

def main():
    createSuperUser()
    populateDB()
    

main()