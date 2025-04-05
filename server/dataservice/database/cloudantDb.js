const CloudantV1 = require('@ibm-cloud/cloudant')
const moment = require('moment')

exports.findById = function findById(service, dbname, id) {

  return new Promise((resolve, reject) => {
    service.getDocument({
      db: dbname,
      docId: id
    }).then(response => {

      // console.log('***Found doc ' + id)
      //console.log(response.result);

      resolve(response.result);
    })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

exports.createDoc = function createDoc(service, dbName, doc) {

  return new Promise((resolve, reject) => {

    // Create the document in Cloudant
    service.postDocument({
      db: dbName,
      document: doc
    }).then(response => {
      resolve(response.result);
    })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

exports.findAllDocs = function findAllDocs(service, dbName) {

  return new Promise((resolve, reject) => {
    // Get all docs
    service.postAllDocs({
      db: dbName,
      includeDocs: true,
      limit: 1000
    }).then(response => {
      console.log('***Found ' + response.result.rows.length + " docs")

      var docs = [];
      var i = 0;

      response.result.rows.forEach(function (doc) {

        var doc = doc.doc

        if (!doc._id.startsWith("_design")) {
          docs[i] = doc;
          i++;
        }
      })

      let res = docs.reduce((acc, curr) => {
        let ind = acc.findIndex((item) => item.timestamp > curr.timestamp);
        if (ind === -1) ind = acc.length;
        acc.splice(ind, 0, curr);
        return acc;
      }, []);

      const returnDocs = {
        "Docs": res
      }

      resolve(returnDocs);
    })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

exports.getExpiredDocs = function getExpiredDocs(service, purgeWindow, dbName) {

  const purgeDate =  moment(new Date()).subtract(purgeWindow, 'hours').format('YYYY-MM-DDThh:mm:ss.000z');
  console.log("Purge window is " + purgeWindow + " hours");
  console.log("Purge docs created before " + purgeDate);

  return new Promise((resolve, reject) => {
    // Get all docs
    service.postAllDocs({
      db: dbName,
      includeDocs: true,
    }).then(response => {
      //console.log('***Purge candidates ' + response.result.rows)

      var docs = [];
      var i = 0;

      response.result.rows.forEach(function (doc) {

        var doc = doc.doc
        
        if (!doc._id.startsWith("_design") && (doc._id < purgeDate)) {
          doc._deleted = true
          docs[i] = doc;
          console.log('***DELETE ' + doc._id)
          i++;
        }   
      })

      resolve(docs);
    })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

exports.updateDoc = function updateDoc(service, dbName, doc, newDoc) {
  return new Promise((resolve, reject) => {

    // Upate old doc with new doc
    newDoc._id = doc._id
    newDoc._rev = doc._rev

    // Update the document in Cloudant
    service.postDocument({
      db: dbName,
      document: newDoc
    }).then(response => {
      console.log(response.result);
      resolve(response.result);
    });

  }).catch((err) => {
    console.error('Error occurred: ' + err.message, 'updateDoc()');
    reject(err);
  });
}

exports.deleteDocs = function deleteDocs(service, dbName, docs) {
  
  return new Promise((resolve, reject) => {
      service.postBulkDocs({
      db: dbName,
      bulkDocs: { "docs": docs }
    }
    )
  })
}

