const {ASYNC_MAX_RETRY} = require('./constantsGraphQL');
const {makeExecutableSchema} = require('graphql-tools');
const retry = require('async-retry');
const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';
const typeDefs = [`
    type Query {
    movie: Movie
    Searchmovie(id : String!): Movie
    SearchMovies(limit : Int, metascore : Int): [Movie]
    populate : Int
    AddMovies(int : Int, review : String, Date : String) : Movie
  }
  
  type Movie {
    link: String
    metascore: Int
    synopsis: String
    title: String
    year: Int
    reviews : String
    date : String
  }
  schema {
    query : Query
  }`
];

const resolvers = {
  'Query': {
    'movie': async (obj, args, context) => {
      
      const {collection} = context;
      return await retry(async () => {
        const cursor = await collection.aggregate([{$match :{ metascore: { $gte: 70 }} },{$sample : {size : 1}}]);
        const docs = await cursor.toArray();
        console.log(docs[0]);
        return docs[0];
        //return await collection.aggregate([{$match :{ metascore: { $gte: 70 }} },{$sample : {size : 1}}]);
      }, {'retries': ASYNC_MAX_RETRY});
    },
    'populate': async (obj, args, context) => {
      
      const {collection} = context;
      return await retry(async () => {
        imdb(DENZEL_IMDB_ID).then((val)=>{
          movies = val;
          collection.insertMany(movies,(error,result)=>{
            if(error){
              return res.status(500).send(error);
            }
            console.log('populating successful of '+ result.result.n + "  movies");
            return result.result.n;
          });
        });  
        //return await collection.aggregate([{$match :{ metascore: { $gte: 70 }} },{$sample : {size : 1}}]);
      }, {'retries': ASYNC_MAX_RETRY});
    },
    'Searchmovie': async (obj, args, context) => {
      
      const {collection} = context;
      const {id} = args;
      console.log(id);
      return await retry(async () => {
        const cursor = await collection.aggregate([{$match :{ id : id }},{$sample : {size : 1}}]);
        const docs = await cursor.toArray();
        console.log(docs[0]);
        return docs[0];
        //return await collection.aggregate([{$match :{ metascore: { $gte: 70 }} },{$sample : {size : 1}}]);
      }, {'retries': ASYNC_MAX_RETRY});
    },
    'SearchMovies': async (obj, args, context) => {
      
      const {collection} = context;
      var limit = args.limit;
      var _metascore = args.metascore;
      if(args.metascore==null)
        limit=5;
      if(_metascore==null)
        _metascore=0;
      console.log(args.limit);
      return await retry(async () => {
        const cursor = collection.aggregate([{$match :{  metascore: { $gte: parseInt(_metascore,10)  }} },{$sample : {size : parseInt(limit,10) }}]);
        const docs = await cursor.toArray();
        console.log(docs);
        return docs;
        //return await collection.aggregate([{$match :{ metascore: { $gte: 70 }} },{$sample : {size : 1}}]);
      }, {'retries': ASYNC_MAX_RETRY});
    }
  }
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers
});