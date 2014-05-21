Promise    = require 'bluebird'
superagent = require 'superagent'
Document   = require '../lib/Document'
create     = require '../lib/create'

get = Promise.promisify superagent.get


countCharacters = (prev, curr) ->
  new Promise (resolve) ->
    setTimeout -> 
      resolve prev + curr.content.length
    , 500

translate = (text) ->
  get "http://mymemory.translated.net/api/get?q=#{text}!&langpair=en|no" 
  .then (response) ->
    matches = response.body.matches
    matches[0].translation



documentNames = [ 'lucy', 'esme', 'mary' ]


documents = Promise.map documentNames, (name) -> get("/api/document/#{name}").get 'body'
                   .map (body) -> new Document name: body.name, content: body.content

translatedDocuments = documents.map (document) -> 
  translate(document.content)
  .then (translation) -> new Document name: document.name, content: translation


contentLength = documents.reduce countCharacters, 0

translatedContentLength = translatedDocuments.reduce countCharacters, 0



contentLength
  .then (length) -> console.log 'contentLength', length

translatedContentLength
  .then (length) -> console.log 'translatedContentLength', length
  .catch Error, (error) -> console.error 'Error -- ', error.stack



