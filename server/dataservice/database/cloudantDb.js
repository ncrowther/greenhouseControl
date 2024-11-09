exports.findById = function findById(service, dbname, id) {

  return new Promise((resolve, reject) => {
    service.getDocument({
      db: dbname,
      docId: id
    }).then(response => {

      console.log('***Found doc ' + id)
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
      console.log(response.result);
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
      console.log('***Found ' + response.result.rows)

      var cases = [];
      var i = 0;

      response.result.rows.forEach(function (doc) {

        console.log('***Doc ' + doc)

        var casedoc = doc.doc
        if (!casedoc._id.startsWith("_design")) {
          cases[i] = casedoc;
          i++;
        }
      })

      let res = cases.reduce((acc, curr) => {
        let ind = acc.findIndex((item) => item.timestamp > curr.timestamp);
        if (ind === -1) ind = acc.length;
        acc.splice(ind, 0, curr);
        return acc;
      }, []);
      console.log(res);

      const docs = {
        "Docs": res
      }

      resolve(docs);
    })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}