


module.exports = function( Constructor ) {
  return function(a,b,c,d,e,f,g){
    return new Constructor(a,b,c,d,e,f,g)
  }
}