# Demo Angular App with Express REST API

[CHECK OUT THE DEMO](https://project-jogging-tracker.herokuapp.com)

This example project allows users to track their daily jogs.

Users can have one of 3 different user roles with different permissions:
  - User:           CRUD on own records
  - UserManager:    CRUD on all users
  - Admin:          CRUD on all records and users

Demo accounts with the following credentials exist for each role type:
- User: `user@test.com`, `password`
- UserManager: `usermanager@test.com`, `password`
- Admin: `admin@test.com`, `password`

## Running locally

- `gulp build --env <environment>`

`env` can be either `development` or `production`. If not specified, the value of the NODE_ENV env var will be used.

Environment variables can be specified in a `.env` file in the project root folder when developing locally, e.g.:
`NODE_ENV=development
PORT=3000`

To test the API:
- `gulp test`

You can build and run the app locally with:
- `gulp build && npm start`
