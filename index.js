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
        console.log(findObject);
        return collection.find(findObject).toArray();
      },
    },
    // Add new tour
    {
      method: 'POST',
      path: '/api/tours',
      handler: (req, res) => {
        res('Adding new tour');
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
      handler: (req, res) => {
        res(`Updating ${req.params.name}`);
      },
    },
    // Delete a Single tour
    {
      method: 'DELETE',
      path: '/api/tours/{name}',
      handler: (req, res) => {
        res(`Deleting ${req.params.name}`).code(204);
      },
    },
    // Home Page
    {
      method: 'DELETE',
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
