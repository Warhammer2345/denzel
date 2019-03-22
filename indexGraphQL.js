const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const cors = require('cors');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const {DENZEL_PORT} = require('./constantsGraphQL');
const schema = require('./schemaGraphQL');

const app = express();
const CONNECTION_URL = "mongodb+srv://Warhammer2345:Azerty1997@seb-cluster-d7cto.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Seb-Cluster";
const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';

   
MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
    if(error) {
        throw error;
    }
    database = client.db(DATABASE_NAME);
    collection = database.collection("movies");
    console.log("Connected to `" + DATABASE_NAME + "`!");

    app.use('/graphql', graphqlHTTP({
        schema : schema,
        'context': {
            collection : collection
        },
        'graphiql': true
    }));
    console.log("2");
    

});




app.listen(DENZEL_PORT, () => {
    console.log('Server listening on port ' + DENZEL_PORT);
});
