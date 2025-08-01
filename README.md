# ProyectoTitulo

Mi proyecto de titulo para optar a titulo de Ingeniero Civil en Informática.

## Getting dependencies installed

You will require the next dependencies to run this project:

- Node Js v22.15.x
- pnpm v10.11.0
- MongoDB
- Python v3.x.x

for installing the rest of dependencies located in the `package.json` file, you will use the following command:

```bash
pnpm i
```

## Getting the development server running

To run the development server, you will use the following command:

```bash
pnpm dev
```

This server will bind to port `8000`, here is an example: [http://localhost:8000](http://localhost:8000) the Frontend server will start to query this development server.

## Building the production server

Use the following command to build the production server:

```bash
pnpm build
```

## Getting the production server running

Use the following command to run the production server:

```bash
pnpm start
```

This server will bind to port `8000`, here is an example: [http://localhost:8000](http://localhost:8000) the Frontend server will start to query this production server.

## Initializing and populating the DB

There is a file called `import.py` that uses Python 3.10,
You will need to install these dependencies to run this file.

- pymongo

Use `pnpm py:setup` command to install them.

Once that's finished, you want to inspect the file `./seeds/import.py`

Line `92` is the function that python uses to connect to MongoDB, you may adjust the DB URL or 'CONNECTION_STRING' as you wish. Also the line `101` is where python chooses the collection to populate, you may adjust that to your usage.

In line `153` is calling this function called `createSuperUser()` that creates the super admin user and inserts it into the db.
You may remove the `#` to enable this function.
The default credentials are:

- Email: `123@123.com`
- Password: `123`

In line `154` is calling this function called `populateDB()` that creates fake people for testing purposes in the system.
You may insert a `#` in the beginning to disable this function as the following:

```
def main():
    #populateDB()
```

To execute this file you may use the following command: `pnpm db:seed`

## .env.example

- `SECRET_JWT_SEED` is the JWT seed that is used to generate the user token.
- `JWT_COOKIE_EXPIRES_IN` is the time that the JSONWebToken cookie is going to expire after in days.
- `SECRET_JWT_SEED_EXPIRATION_TIME` is the time that the user token is going to expire after. you may use the following format: `<Number><s:m:h:d:mo:y>` example: `5m` equals to `5 minutes`.
- `SERVER_PORT` is the port where this server is going to bind.
- `DB_ADDRESS` is the MongoDB database URL, this has to contain the collection name in order to work as the following: `mongodb://localhost:27017/<collection name>`
- `URL_FRONTEND` is the URL where querys are comming from. This usually is the same as the Frontend server.
- `HOW_MANY_HASHES` is the quantity of bcrypt hashes that are going to be when user is authenticating.
- `ALLOWED_CORS_ORIGINS` is from where the api will accept queries
- `NODE_ENV` is the type of environment that will be used, can be `development` or `production`

## Learn More

This project uses:

- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [JSONWebToken](https://www.npmjs.com/package/jsonwebtoken)
- [mongoose](https://mongoosejs.com/)
- [xlsx](https://www.npmjs.com/package/xlsx) - This package might say that has a exploit, but only administrator user has access to the modules related to this package.
