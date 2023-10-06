# ProyectoTitulo
Mi proyecto de titulo para optar a titulo de Ingeniero Civil en Informática.

## Getting dependencies installed

You will require the next dependencies to run this project:

- Node Js v18.15.x
- Yarn v3.6.3
- MongoDB

for installing the rest of dependencies located in the `package.json` file, you will use the following command:

```bash
yarn
```

## Getting the development server running

To run the development server, you will use the following command:

```bash
yarn dev
```

This server will bind to port `8000`, here is an example: [http://localhost:8000](http://localhost:8000) the Frontend server will start to query this development server.

## Getting the production server running

Use the following command to run the production server:

```bash
yarn start
```

This server will bind to port `8000`, here is an example: [http://localhost:8000](http://localhost:8000) the Frontend server will start to query this production server.

## Learn More

This project uses:

- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [JSONWebToken](https://www.npmjs.com/package/jsonwebtoken)
- [mongoose](https://mongoosejs.com/)
- [nodemon](https://www.npmjs.com/package/nodemon)
- [xlsx](https://www.npmjs.com/package/xlsx) - This package might say that has a exploit, but only administrator user has access to the modules related to this package.