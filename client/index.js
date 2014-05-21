var Promise    = require('bluebird')
var superagent = require('superagent')
var Document   = require('../lib/Document')
var create     = require('../lib/create')

var get = Promise.promisify( superagent.get )


var documents = get('/api/document').map( create(Document) )




// var documents = Promise.map(['lucy', 'mary', 'esme'], function( documentName ) {
//   return get('/api/document/' + documentName)
//     .get( 'body' )
//     .then( create(Document) )
// })

// documents.reduce(function(prev, curr) {
//   return Promise.resolve(prev + curr.content.length)
// }, 0)
// .then(function(contentLength) {
//   console.log(contentLength)
// })