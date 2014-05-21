var koa         = require( 'koa' )
var router      = require( 'koa-router' )
var Promise     = require( 'bluebird' )
var fs          = Promise.promisifyAll( require('fs') )
var path        = require( 'path' )
var Document    = require( './lib/Document' )
var browserify  = require( 'browserify' )
var coffeeify   = require( 'coffeeify' )


var app = koa()
app.use( router(app) )


var documentsRoot = './data/documents/'

function compile( path ) {
  return new Promise(function( resolve, reject ) {
    browserify('./client/main.coffee')
    .transform( coffeeify )
    .bundle(function( error, compiled ) {
      if( error )
        return reject( error )
      resolve( compiled )
    })
  })
}

function* getDocumentPath( next ) {
  this.documentpath = path.join( documentsRoot, this.params.name + '.txt' )
  yield next
}

function* getDocumentPaths( next ) {
  this.documentPaths = yield fs.readdirAsync( documentsRoot )
  yield next
}

function* getDocument( next ) {
  try {
    this.document = new Document({ 
      name: this.params.name, 
      content: yield fs.readFileAsync( this.documentpath, 'utf8' ) 
    })
    yield next
  }
  catch( exception ) {
    exception.cause.code == 'ENOENT' ? this.throw( 404 ) :
                                       this.throw( 500 )
  }
}

function* getDocumentsSequential( next ) {
  var i, documents, documentpath

  documents = []

  for( i = 0; i < this.documentPaths.length; i++ ) {
    documentpath = this.documentPaths[ i ]
    documents.push(new Document({
      name:     path.basename(documentpath, '.txt'),
      content:  yield fs.readFileAsync(path.join(documentsRoot, documentpath), 'utf8')
    }))
  }

  this.documents = documents
  yield next
}

function* getDocumentsParalell( next ) {
  this.documents = yield Promise.map( this.documentPaths, 
    function( documentpath ) {
      return fs.readFileAsync(path.join(documentsRoot, documentpath), 'utf8')
        .then(function( content ) {
          return new Document({
            name:     path.basename(documentpath, '.txt'),
            content:  content
          })
        })
    })
  yield next
}


app.get('/', function* () {
  var html, program

  html = yield fs.readFileAsync( './views/index.html', 'utf8' )

  program = yield compile('./client/index.js')
  html = html.replace("__SCRIPT__", program)

  this.body = html
})

app.get('/api/document/:name', getDocumentPath, getDocument, function *() {
  this.body = this.document
})

app.get('/api/document', getDocumentPaths, getDocumentsParalell, function *() {
  this.body = this.documents
})



app.listen( 3000 )
console.log ('server is listening on port: 3000')
