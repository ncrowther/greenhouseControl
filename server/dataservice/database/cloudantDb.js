const CloudantV1 = require('@ibm-cloud/cloudant')
const moment = require('moment')

exports.findById = function findById(service, dbname, id) {

  return new Promise((resolve, reject) => {
    service.getDocument({
      db: dbname,
      docId: id
    }).then(response => {

      // console.log('***Found doc ' + id)
      console.log(response.result);

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
      //console.log('***Found ' + response.result.rows)

      var docs = [];
      var i = 0;

      response.result.rows.forEach(function (doc) {

        var docdoc = doc.doc
        if (!docdoc._id.startsWith("_design")) {
          docs[i] = docdoc;
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

exports.getExpiredDocs = function getExpiredDocs(service, dbName) {

  const purgeDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD');
  console.log(purgeDate);

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

        //console.log('***Doc ' + doc)

        var docdoc = doc.doc
        
        if (!docdoc._id.startsWith("_design") && (docdoc._id < purgeDate)) {
          docdoc._deleted = true
          docs[i] = docdoc;
          console.log('***DELETE ' + docdoc._id)
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

exports.deleteDocs = function deleteDocs(service, dbName, docs) {

  //const bulkDocs: CloudantV1.BulkDocs = {  docs: docs  }
  
  return new Promise((resolve, reject) => {
      service.postBulkDocs({
      db: dbName,
      bulkDocs: { "docs": docs }
    }
    )
  })
}

