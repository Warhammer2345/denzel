const {ASYNC_MAX_RETRY} = require('./constantsGraphQL');
const {makeExecutableSchema} = require('graphql-tools');
const retry = require('async-retry');

const typeDefs = [`
    type Query {
    movie: Movie
    Searchmovie(id : String): Movie
    SearchMovies(limit : Int, metascore : Int): [Movie]
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
    }
  }
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers
});