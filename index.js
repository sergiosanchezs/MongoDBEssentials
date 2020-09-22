const MongoClient = require('mongodb').MongoClient;
const Hapi = require('@hapi/hapi');
require('custom-env').env('mongoDB');

const url = process.env.DB_HOST;
const port = process.env.PORT || 8080;
const host = process.env.SERVER_HOST || 'localhost';

const init = async () => {
  const server = new Hapi.Server({ port, host });
  server.route([
    // Get tour list
    {
      method: 'GET',
      path: '/api/tours',
      config: { json: { space: 2 } },
      handler: (req, res) => {
        let findObject = {};
        for (let key in req.query) {
          findObject[key] = req.query[key];
        }
        // console.log(findObject);
        return collection.find(findObject).toArray();
      },
    },
    // Add new tour
    {
      method: 'POST',
      path: '/api/tours',
      handler: (req, res) => {
        collection.insertOne(req.payload);
        return req.payload;
      },
    },
    // Get a Single tour
    {
      method: 'GET',
      path: '/api/tours/{name}',
      config: { json: { space: 2 } },
      handler: (req, res) => collection.findOne({ tourName: req.params.name }),
    },
    // Update a Single tour
    {
      method: 'PUT',
      path: '/api/tours/{name}',
      handler: async (req, res) => {
        const searchObject = { tourName: req.params.name };
        if (req.query.replace == 'true') {
          req.payload.tourName = req.params.name;
          await collection.replaceOne(searchObject, req.payload);
          return await collection.findOne(searchObject);
        } else {
          await collection.updateOne(searchObject, { $set: req.payload });
          return await collection.findOne(searchObject);
        }
      },
    },
    // Delete a Single tour
    {
      method: 'DELETE',
      path: '/api/tours/{name}',
      handler: async (req, res) => {
        const searchObject = { tourName: req.params.name };
        let rs;
        console.log(`deleteall: ${req.query.deleteall}`);
        if (req.query.deleteall == 'true') {
          rs = await collection.deleteMany(searchObject);
          console.log(`Many: ${rs.result.n}`);
        } else {
          rs = await collection.deleteOne(searchObject);
          console.log(`One: ${rs.result.n}`);
        }
        return {
          message: `success: ${rs.result.n} document${
            rs.result.n > 1 ? 's' : ''
          } was deleted successfully!`,
        };
      },
    },
    // Home Page
    {
      method: 'GET',
      path: '/',
      handler: (req, res) => {
        res('Hello World from Hapi/Mongo example!');
      },
    },
  ]);
  await server.start();
  console.log(`Hapi is listening to ${server.info.uri}`);
};

MongoClient.connect(url, (err, db) => {
  if (!err) {
    console.log('Connected successfully to server');
    collection = db.collection('tours');
    process.on('unhandledRejection', err => {
      console.log(err);
      process.exit(1);
    });
    init();
  }
});

// Way to do it with callbacks
// const findDocuments = (db, callback) => {
//   const collection = db.collection('tours');
//   collection.find().toArray((err, docs) => {
//     if (!err) {
//       console.log(docs);
//       callback;
//     }
//   });
// };

// MongoClient.connect(url, (err, db) => {
//   if (!err) {
//     console.log('Connected successfully to server');
//     findDocuments(db, () => {
//       db.close();
//     });
//   }
// });

// way to do it with Promises
// const findDocuments = db =>
//   new Promise((resolve, reject) => {
//     const collection = db.collection('tours');
//     collection.find({ tourPackage: 'Snowboard Cali' }).toArray((err, docs) => {
//       if (!err) {
//         // console.log(docs);
//         resolve(docs);
//       } else reject(err);
//     });
//   });

// MongoClient.connect(url, (err, db) => {
//   if (!err) {
//     console.log('Connected successfully to server');
//     findDocuments(db)
//       .then(docs => {
//         console.log(docs);
//         db.close();
//         console.log('dB connection closed!');
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
// });
