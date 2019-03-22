const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
var app = Express();
const CONNECTION_URL = "mongodb+srv://Warhammer2345:Azerty1997@seb-cluster-d7cto.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Seb-Cluster";
const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';
/*var movies = null;
var awesome = null;*/
async function sandbox (actor) {
    try {
      console.log(`📽️  fetching filmography of ${actor}...`);
      const movies = await imdb(actor);
      console.log("test");
      const awesome = movies.filter(movie => movie.metascore >= 77);
      console.log("ras");
      //console.log(`🍿 ${movies.length} movies found.`);
      //console.log(JSON.stringify(movies, null, 2));
      console.log(`🥇 ${awesome.length} awesome movies found.`);
      /*console.log(JSON.stringify(awesome, null, 2));
      process.exit(0);*/
    } catch (e) {
      console.error(e);
      //process.exit(1);
    }
  }




sandbox(DENZEL_IMDB_ID);
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));

var database, collection;

app.listen(3000, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("movies");
        console.log("Connected to `" + DATABASE_NAME + "`!");
        
    });
});
app.get("/movies/populate", (request, response) => {
    if(!collection){
        return response.status(500).send('The database s not connected');
      }
      imdb(DENZEL_IMDB_ID).then((val)=>{
        movies = val;
        collection.insertMany(movies,(error,result)=>{
          if(error){
            return res.status(500).send(error);
          }
          console.log('populating successful of '+ result.result.n + "  movies");
          retour = {"total" : result.result.n};
          response.send(retour);
        });
      });    
});
app.post("/person", (request, response) => {
    collection.insert(request.body, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });
});

app.post("/Chargement", (request, response) => {
    collection.insert(movies, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });
});

app.get("/movies", (request, response) => {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    collection.aggregate([{$match :{ metascore: { $gte: 70 }} },{$sample : {size : 1}}]).toArray(function(error, result) {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(JSON.stringify(result, null, 2));
    });
});

app.get("/movies/:id", (request, response) => {
    collection.aggregate([{$match :{ id : request.params.id }},{$sample : {size : 1}}]).toArray(function(error, result) {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(JSON.stringify(result, null, 2));
    });
});
app.get('/test', async function(req, res) {

    // Access the provided 'page' and 'limt' query parameters
    let limit = req.query.limit;


    res.send(limit);
});
app.get('/search', (request, response) => {
  
    var limit=5;
    var _metascore=0;
    console.log(_metascore);
    console.log(limit);
    if( typeof request.query.limit != 'undefined' ){
      limit=request.query.limit
    }
    console.log(limit);
    if( typeof request.query.metascore != 'undefined' ){
        _metascore=request.query.metascore;
    }
    console.log(_metascore);
      collection.aggregate([{$match :{  metascore: { $gte: parseInt(_metascore,10)  }} },{$sample : {size : parseInt(limit,10) }}]).toArray(function(error, result) {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(JSON.stringify(result, null, 2));
    });
  });

  app.post('/movies/:id', (request, response) => {
    //response.send('POST request to the homepage');
    /*collection.aggregate([{$match :{ id : request.params.id }},{$sample : {size : 1}}]).toArray(function(error, result) {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(JSON.stringify(result, null, 2));
    });*/
    console.log(request.body.date);
    collection.update({id : request.params.id},{$set : {"reviews" : request.body.review , "date":request.body.date}}, function(err, result) {
        if(err){
            console.log(err)
            throw err;
        }
        response.send(JSON.stringify(result, null, 2));
    });
    
});

/*app.post("/person", (request, response) => {
    collection.insert(request.body, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });
});

curl -X POST \
    -H 'content-type:application/json' \
    -d '{"firstname":"Maria","lastname":"Raboy"}' \
    http://localhost:3000/person

curl -X POST -H 'content-type: application/json' -d {"date": "2019-03-04", "review": "Great"}  http://localhost:3000/movies/tt0328107 {
  "_id": "507f191e810c19729de860ea"
}*/