const {ASYNC_MAX_RETRY} = require('./constantsGraphQL');
const {makeExecutableSchema} = require('graphql-tools');
const retry = require('async-retry');
const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';
const typeDefs = [`
    type Query {
    movie: Movie
    Searchmovie(id : String): Movie
    SearchMovies(limit : Int, metascore : Int): [Movie]
    populate : Int
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
    }
  }
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers
});