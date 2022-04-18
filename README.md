# EQ Admin

## Local Setup

Install JS Dependencies

```sh
npm install
```

Create .env

use .env.example and change your database username accordingly

Create Database

```sh
npm run init-db
npm run push-schema
```

Populate Database

You'll need to retrieve data from https://www.churchofjesuschrist.org/
Login and go to directory
Open Dev tools and look for an api call made to `https://directory.churchofjesuschrist.org/api/v4/households?unit=xxxxxx`
Copy the response of this api call into a json file `/prisma/data.json`

```sh
npm run load-data
```

Run the app

```sh
npm run dev
```
