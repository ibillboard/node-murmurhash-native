#!/usr/bin/env node
var ben            = require('ben')
,   hash           = require('..')
,   incr           = require('../incremental')
,   assert         = require('assert')
,   iters          = 10000
,   crypto         = require('crypto')
,   createHash     = crypto.createHash
,   stringEncoding = process.argv[2] || 'binary';

if (stringEncoding)
  console.log('string encoding: %s', stringEncoding);

function cryptohasher(name, data, encoding) {
  var sum = createHash(name);
  sum.update(data, encoding);
  return sum.digest('hex');
}

function incremental(constr) {
  return function(data, encoding) {
    return new constr().update(data, encoding).digest('number');
  }
}

var funmatrix = [
  [hash.murmurHash,                    'murmurHash              '],
  [hash.murmurHash64x86,               'murmurHash64x86         '],
  [hash.murmurHash64x64,               'murmurHash64x64         '],
  [hash.murmurHash128x86,              'murmurHash128x86        '],
  [hash.murmurHash128x64,              'murmurHash128x64        '],
  [incremental(incr.MurmurHash),       'MurmurHash              '],
  [incremental(incr.MurmurHash128x64), 'MurmurHash128x64        ']
];

crypto.getHashes().forEach(function(cipher) {
  var pad = '                        ';
  funmatrix.push([
      function(data, encoding) { return cryptohasher(cipher, data, encoding) },
      cipher + pad.substr(0, pad.length - cipher.length)
    ]);
});

function fillrandom(buffer) {
  for(var i = 0; i < buffer.length; ++i)
    buffer[i] = (Math.random()*0x100)|0;
  return buffer;
}

function randomstring(length) {
  var buffer = fillrandom(new Buffer(length));
  return buffer.toString('binary');
}

function bench(size, inputStr, iters) {
  var input = inputStr
            ? randomstring(size)
            : fillrandom(new Buffer(size));
  funmatrix.forEach(function(args) {
    var fun = args[0], name = args[1]
    measure("string", fun, name, iters, size, input);
  });
}

bench(80, true, iters*10);
bench(250, true, iters*10);
bench(128*1024, true, iters);
bench(128*1024, false, iters);

function measure(label, fun, name, iters, size, arg) {
  ben(iters, function(){ fun(arg) }); // warm-up
  var ms = ben(iters, function(){ fun(arg, stringEncoding, 'number') });
  console.log(name + "(" + label + "[" + size + "]): %s %s",
    ((1 / ms / 1000) * size).toFixed(4) + 'MB/s',
    fun(arg, stringEncoding, 'number'));
}
