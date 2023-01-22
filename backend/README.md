# Sample Auth API

This api demonstrates the flow of building an authentication/authorization service using nodejs (express) and mongodb.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGO_DB_URL` - Endpoint of the Mongo DB used.

`EXPRESS_PORT` - Port in which express server should listen. If your hosting provider issues a default port, this value will be overridden.

`JWT_SECRET` - The key used to sign JWTs issued on login.

## Installation

Clone the project to your local system or desired machine.
Run the following commands from the root folder of the project.

```bash
  cd backend
```

Make a copy of the `.env.example` file and place the values for the environment varibles there.
Run the following commands:

```bash
  yarn
  yarn setup
  yarn start
```

The api will be up and running in the `EXPRESS_PORT` variable supplied or the `PORT` variable supplied by your hosting provider.

## API Reference

Any custom types used here will be explained in the Appendix.

#### Sign Up

```http
  POST /auth/signup
```

| Parameter        | Type      | Description                       |
| :--------------- | :-------- | :-------------------------------- |
| `username`       | `string`  | **Required**. Desired username    |
| `pasword`        | `string`  | **Required**. Desired password    |
| `repeatPassword` | `string`  | **Required**. Reenter password    |
| `email`          | `string`  | **Required**. Email address       |
| `name`           | `string`  | **Required**. Name of the user    |
| `address`        | `address` | **Required**. Address of the user |

responds with `successBasedReturn`. If `success = true`, the data value in the response will be:

| Parameter  | Type      | Description                             |
| :--------- | :-------- | :-------------------------------------- |
| `username` | `string`  | **Required**. Username of the user      |
| `email`    | `string`  | **Required**. Email address of the user |
| `name`     | `string`  | **Required**. Name of the user          |
| `address`  | `address` | **Required**. Address of the user       |

#### Login

```http
  POST /auth/login
```

| Parameter         | Type     | Description                   |
| :---------------- | :------- | :---------------------------- |
| `usernameOrEmail` | `string` | Username or email of the user |
| `password`        | `string` | Password of the user          |

responds with `successBasedReturn`. If `success = true`, the data value in the response will be:

| Parameter  | Type     | Description                                                                   |
| :--------- | :------- | :---------------------------------------------------------------------------- |
| `username` | `string` | Username of the user                                                          |
| `email`    | `string` | Email address of the user                                                     |
| `token`    | `string` | Json Web Token issued for current login (expires in 1hour of the issued time) |

## Appendix

The custom types in the API Reference are explained here.

type `address`:
| Parameter | Type | Description |
| :---------------- | :------- | :-------------------------------- |
| `city` | `string` | **Required**. City of the user |
| `zip` | `string` | **Required**. Any valid zip code |

type `successBasedReturn`:
| Parameter | Type | Description |
| :---------------- | :------- | :-------------------------------- |
| `success` | `boolean` | **Always Present**. Whether the request is succcessful |
| `statusCode` | `number` | **Always Present**. A valid HTTP status code of the response |
| `message` | `number` | **Always Present**. One line message explaining the status of the response |
| `errors` | `string[]` | **Always Present**. List of all errors occurred in the backend |
| `data` | `object` | **Presnt if success is true**. Actual data returned from the server |
