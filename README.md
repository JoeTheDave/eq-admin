# EQ Admin

## Local Setup

### Install JS Dependencies

```sh
npm install
```

### Create .env

using .env.example as a guide and changing values to be relevant for your app

### Create Database

```sh
npm run init-db
npm run push-schema
```

### Populate Database

You'll need to retrieve data from https://www.churchofjesuschrist.org/
Login and go to directory
Open Dev tools and look for an api call made to `https://directory.churchofjesuschrist.org/api/v4/households?unit=xxxxxx`
Copy the response of this api call into a json file `/prisma/data.json`

```sh
npm run load-data
```

### Run the app

```sh
npm run dev
```

## TODO

- [ ] Bug: Map pins render several times for each toggle
- [ ] Bug: Multiple households living in same address have pins mapped over each other - combine into single pin
- [ ] Add ability to view n number of close households
- [ ] Enhance the import process to ensure data continuity
- [ ] Add household comments
