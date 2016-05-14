"use strict";

var test = require("tap").test
  , hash = require('..')
;

test("should have murmurHash functions", function(t) {
  t.type(hash.murmurHash, 'function');
  t.strictEqual(hash.murmurHash.name, 'murmurHash');
  t.type(hash.murmurHash32, 'function');
  t.strictEqual(hash.murmurHash32.name, 'murmurHash32');
  t.type(hash.murmurHash64, 'function');
  t.strictEqual(hash.murmurHash64.name, 'murmurHash64');
  t.type(hash.murmurHash64x64, 'function');
  t.strictEqual(hash.murmurHash64x64.name, 'murmurHash64x64');
  t.type(hash.murmurHash64x86, 'function');
  t.strictEqual(hash.murmurHash64x86.name, 'murmurHash64x86');
  t.type(hash.murmurHash128x64, 'function');
  t.strictEqual(hash.murmurHash128x64.name, 'murmurHash128x64');
  t.type(hash.murmurHash128, 'function');
  t.strictEqual(hash.murmurHash128.name, 'murmurHash128');
  t.type(hash.murmurHash128x86, 'function');
  t.strictEqual(hash.murmurHash128x86.name, 'murmurHash128x86');
  t.end();
});

[
  [4, 'murmurHash', hash.murmurHash, 0, 2180083513, 1364076727,
      '00000000', '396ff181', 'b7284e51',
      'd11c1950'],
  [4, 'murmurHash', hash.murmurHash32, 0, 2180083513, 1364076727,
      '00000000', '396ff181', 'b7284e51',
      'd11c1950'],
  [8, 'murmurHash64x64', hash.murmurHash64x64,
      '0000000000000000', '952d4201a42f3c31', 'c6a4a7935bd064dc',
      '0000000000000000', '313c2fa401422d95', 'dc64d05b93a7a4c6',
      '71b1be73e08a71e5'],
  [8, 'murmurHash64x86', hash.murmurHash64x86,
      '0000000000000000', 'f107ca78f6c98ab0', 'dd9f019f79505248',
      '0000000000000000', 'b08ac9f678ca07f1', '485250799f019fdd',
      '5b8ffc9cf60c0120'],
  [16, 'murmurHash128x64', hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251',
      'b55cc0152721ca566f0749fb7d73a43a'],
  [16, 'murmurHash128x86', hash.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254',
      '9d94cc09d28d0a26151324de151324de'],
].forEach(function(args)  {

  var size                = args[ 0]
    , label               = args[ 1]
    , murmurHash          = args[ 2]
    , seedZeroDefault     = args[ 3]
    , seedMinusOneDefault = args[ 4]
    , seedPlusOneDefault  = args[ 5]
    , seedZeroHex         = args[ 6]
    , seedMinusOneHex     = args[ 7]
    , seedPlusOneHex      = args[ 8]
    , crashTestHex        = args[ 9]
    , seedZeroBuffer      = new Buffer(seedZeroHex,  'hex')
    , seedMinusOneBuffer  = new Buffer(seedMinusOneHex, 'hex')
    , seedPlusOneBuffer   = new Buffer(seedPlusOneHex,  'hex')


  test(label, function(t) {

    t.type(murmurHash, 'function');

    t.test('should throw error for bad arguments', function(t) {
      t.plan(21*3);
      function cberr1(err) {
        t.type(err, TypeError);
        t.strictEqual(err.message, "string or Buffer is required");
      }
      function cberr2(err) {
        t.type(err, TypeError);
        t.strictEqual(err.message, "\"encoding\" must be a valid string encoding");
      }
      function cberr3(err) {
        t.type(err, TypeError);
        t.strictEqual(err.message, "Unknown output type: should be \"number\" or \"buffer\"");
      }
      t.strictEqual(undefined, murmurHash(cberr1));
      t.strictEqual(undefined, murmurHash({}, cberr1));
      t.strictEqual(undefined, murmurHash([], cberr1));
      t.strictEqual(undefined, murmurHash(void(0), cberr1));
      t.strictEqual(undefined, murmurHash(null, cberr1));
      t.strictEqual(undefined, murmurHash(true, cberr1));
      t.strictEqual(undefined, murmurHash(false, cberr1));
      t.strictEqual(undefined, murmurHash(0, cberr1));
      t.strictEqual(undefined, murmurHash(1, cberr1));
      t.strictEqual(undefined, murmurHash(-1, cberr1));
      t.strictEqual(undefined, murmurHash(new Date(), cberr1));
      t.strictEqual(undefined, murmurHash("", "abcdefghijklmno", cberr2));
      t.strictEqual(undefined, murmurHash("", "123456", cberr2));
      t.strictEqual(undefined, murmurHash("", "12345", cberr2));
      t.strictEqual(undefined, murmurHash("", "1234", cberr2));
      t.strictEqual(undefined, murmurHash("", "123", cberr2));
      t.strictEqual(undefined, murmurHash("", "", cberr2));
      t.strictEqual(undefined, murmurHash("", 0, "", cberr3));
      t.strictEqual(undefined, murmurHash("", 0, "mumber", cberr3));
      t.strictEqual(undefined, murmurHash("", 0, "xxxxxxx", cberr3));
      t.strictEqual(undefined, murmurHash("", 0, "utf-8", cberr3));
    });

    t.test('should create number hash from empty data', function(t) {
      t.plan(20*3);
      function cbfactory(value) {
        return function(err, result) {
          t.error(err);
          t.strictEqual(result, value);
        }
      }
      t.strictEqual(undefined, murmurHash('', cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash('', 'number', cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 'number', cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash('', -1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', -1, 'number', cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), -1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), -1, 'number', cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', 4294967295, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', 4294967295, 'number', cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 4294967295, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 4294967295, 'number', cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', 4294967296, cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash('', 4294967296, 'number', cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 4294967296, cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 4294967296, 'number', cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash('', 1, cbfactory(seedPlusOneDefault)));
      t.strictEqual(undefined, murmurHash('', 1, 'number', cbfactory(seedPlusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 1, cbfactory(seedPlusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 1, 'number', cbfactory(seedPlusOneDefault)));
    });

    t.test('should create buffer hash from empty data', function(t) {
      t.plan(20*3);
      function cbfactoryBuffer(value) {
        return function(err, result) {
          t.error(err);
          t.deepEqual(result, value);
        }
      }
      function cbfactoryHex(value) {
        return function(err, result) {
          t.error(err);
          t.strictEqual(result.toString('hex'), value);
        }
      }
      t.strictEqual(undefined, murmurHash('', 0, 'buffer', cbfactoryBuffer(seedZeroBuffer)));
      t.strictEqual(undefined, murmurHash('', 0, 'buffer', cbfactoryHex(seedZeroHex)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 'buffer', cbfactoryBuffer(seedZeroBuffer)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 'buffer', cbfactoryHex(seedZeroHex)));
      t.strictEqual(undefined, murmurHash('', -1, 'buffer', cbfactoryBuffer(seedMinusOneBuffer)));
      t.strictEqual(undefined, murmurHash('', -1, 'buffer', cbfactoryHex(seedMinusOneHex)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), -1, 'buffer', cbfactoryBuffer(seedMinusOneBuffer)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), -1, 'buffer', cbfactoryHex(seedMinusOneHex)));
      t.strictEqual(undefined, murmurHash('', 4294967295, 'buffer', cbfactoryBuffer(seedMinusOneBuffer)));
      t.strictEqual(undefined, murmurHash('', 4294967295, 'buffer', cbfactoryHex(seedMinusOneHex)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 4294967295, 'buffer', cbfactoryBuffer(seedMinusOneBuffer)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 4294967295, 'buffer', cbfactoryHex(seedMinusOneHex)));
      t.strictEqual(undefined, murmurHash('', 4294967296, 'buffer', cbfactoryBuffer(seedZeroBuffer)));
      t.strictEqual(undefined, murmurHash('', 4294967296, 'buffer', cbfactoryHex(seedZeroHex)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 4294967296, 'buffer', cbfactoryBuffer(seedZeroBuffer)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 4294967296, 'buffer', cbfactoryHex(seedZeroHex)));
      t.strictEqual(undefined, murmurHash('', 1, 'buffer', cbfactoryBuffer(seedPlusOneBuffer)));
      t.strictEqual(undefined, murmurHash('', 1, 'buffer', cbfactoryHex(seedPlusOneHex)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 1, 'buffer', cbfactoryBuffer(seedPlusOneBuffer)));
      t.strictEqual(undefined, murmurHash(new Buffer(''), 1, 'buffer', cbfactoryHex(seedPlusOneHex)));
    });

    t.test('should utilize different string input encodings', function(t) {
      t.plan(10*4+5*3);
      function cbfactory(arg) {
        return function(err, result) {
          t.error(err);
          murmurHash(arg, function(err, result2) {
            t.error(err);
            t.strictEqual(result, result2);
          });
        }
      }
      function cbfactory2(value) {
        return function(err, result) {
          t.error(err);
          t.strictEqual(result, value);
        }
      }
      var string = "\u1220łóżko"
        , base64 = 'IELzfGtv'
        , hex = '2042f37c6b6f'
        , hash = murmurHash(string);
      t.strictEqual(undefined, murmurHash(new Buffer(string, 'binary'), cbfactory2(hash)));
      t.strictEqual(undefined, murmurHash(string, 'ascii', cbfactory(new Buffer(string, 'ascii'))));
      t.strictEqual(undefined, murmurHash(string, 'ascii', cbfactory2(hash)));
      t.strictEqual(undefined, murmurHash(string, 'binary', cbfactory(new Buffer(string, 'binary'))));
      t.strictEqual(undefined, murmurHash(string, 'binary', cbfactory2(hash)));
      t.strictEqual(undefined, murmurHash(string, 'utf8', cbfactory(new Buffer(string, 'utf8'))));
      t.strictEqual(undefined, murmurHash(string, 'utf-8', cbfactory(new Buffer(string, 'utf-8'))));
      t.strictEqual(undefined, murmurHash(string, 'ucs2', cbfactory(new Buffer(string, 'ucs2'))));
      t.strictEqual(undefined, murmurHash(string, 'ucs-2', cbfactory(new Buffer(string, 'ucs-2'))));
      t.strictEqual(undefined, murmurHash(string, 'utf16le', cbfactory(new Buffer(string, 'utf16le'))));
      t.strictEqual(undefined, murmurHash(string, 'utf-16le', cbfactory(new Buffer(string, 'utf-16le'))));
      t.strictEqual(undefined, murmurHash(base64, 'base64', cbfactory2(hash)));
      t.strictEqual(undefined, murmurHash(base64, 'base64', cbfactory(new Buffer(base64, 'base64'))));
      t.strictEqual(undefined, murmurHash(hex, 'hex', cbfactory2(hash)));
      t.strictEqual(undefined, murmurHash(hex, 'hex', cbfactory(new Buffer(hex, 'hex'))));
    });


    t.test('should create hash from some random data', function(t) {
      t.plan(2*3+5*4+3*4);
      function cbfactoryLen() {
        return function(err, result) {
          t.error(err);
          t.equal(result.length, size);
        }
      }
      function cbfactory(arg, seed) {
        return function(err, result) {
          t.error(err);
          if (seed == undefined)
            murmurHash(arg, cb);
          else
            murmurHash(arg, seed, cb);
          function cb(err, result2) {
            t.error(err);
            t.strictEqual(result, result2);
          }
        }
      }
      function cbfactory2(assertion, arg, seed, output) {
        return function(err, result) {
          t.error(err);
          if (output == undefined)
            murmurHash(arg, seed, cb);
          else
            murmurHash(arg, seed, output, cb);
          function cb(err, result2) {
            t.error(err);
            t[assertion](result, result2);
          }
        }
      }
      var data = '';
      for (var i = 0; i < 1000; ++i) data += String.fromCharCode((Math.random()*32768)|0);
      var buffer = new Buffer(data, 'binary');
      t.strictEqual(undefined, murmurHash(data, 0, 'buffer', cbfactoryLen()));
      t.strictEqual(undefined, murmurHash(buffer, 'buffer', cbfactoryLen()));
      t.strictEqual(undefined, murmurHash(data, 'utf8', cbfactory(new Buffer(data, 'utf8'))));
      t.strictEqual(undefined, murmurHash(data, cbfactory(buffer)));
      t.strictEqual(undefined, murmurHash(data, -1, cbfactory(buffer, -1)));
      t.strictEqual(undefined, murmurHash(data, -1, cbfactory(buffer, 4294967295)));
      t.strictEqual(undefined, murmurHash(data, 4294967295, cbfactory(buffer, -1)));

      var seed = (Math.random()*4294967296)|0;
      t.strictEqual(undefined, murmurHash(data, seed, 'buffer', cbfactory2('notStrictEqual', buffer, seed, 'buffer')));
      t.strictEqual(undefined, murmurHash(data, seed, 'buffer', cbfactory2('deepEqual', buffer, seed, 'buffer')));
      t.strictEqual(undefined, murmurHash(data, seed, cbfactory2('strictEqual', buffer, seed)));
    });

    t.test('should interpret 1 argument properly', function(t) {
      t.plan(2*3);
      function cbfactory(value) {
        return function(err, result) {
          t.error(err);
          t.strictEqual(result, value);
        }
      }
      t.strictEqual(undefined, murmurHash('', cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), cbfactory(seedZeroDefault)));
    });

    t.test('should interpret 2[+2] arguments properly', function(t) {
      t.plan(4*4 + 6*5 + 10*4);
      function cbfactory(value) {
        return function(err, result) {
          t.error(err);
          t.strictEqual(typeof result, typeof value);
          if ('string' === typeof value) {
            t.strictEqual(result, value);
          } else {
            t.deepEqual(result, value);
          }
        }
      }
      function cbfactory2() {
        var args = [].slice.call(arguments, 0);
        return function(err, result) {
          t.error(err);
          args.push(function(err, result2) {
            t.error(err);
            t.strictEqual(typeof result, typeof result2);
            if ('string' === typeof result2) {
              t.strictEqual(result, result2);
            } else {
              t.deepEqual(result, result2);
            }
          });
          murmurHash.apply(this, args);
        }
      }
      function cbfactory3(value, cb) {
        return function(err, result) {
          t.error(err);
          t.strictEqual(result, value);
          cb();
        }
      }
      t.strictEqual(undefined, murmurHash('', 0, cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash('', -1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), 0, cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8',
                    cbfactory2(new Buffer('\u1234', 'utf8'))));
      t.strictEqual(undefined, murmurHash('\u1234', 'ascii',
                    cbfactory2(new Buffer('\u1234', 'ascii'))));
      t.strictEqual(undefined, murmurHash('\u1234', 'binary',
                    cbfactory2(new Buffer('\u1234', 'binary'))));
      t.strictEqual(undefined, murmurHash(new Buffer([0xFF]),
                    cbfactory2(new Buffer('\u12FF', 'binary'))));
      t.strictEqual(undefined, murmurHash(new Buffer([0xFF]), 'number',
                    cbfactory2(new Buffer('\u12FF', 'binary'), 'number')));
      t.strictEqual(undefined, murmurHash(new Buffer([0xFF]), 'buffer',
                    cbfactory2(new Buffer('\u12FF', 'binary'), 'buffer')));

      var buf = new Buffer(size); buf.fill(-1);
      t.strictEqual(undefined, murmurHash('', buf, cbfactory3(buf, function() {
        t.deepEqual(buf, new Buffer(seedZeroHex, 'hex'));
      })));
      var bufb = new Buffer(size); bufb.fill(-1);
      t.strictEqual(undefined, murmurHash(new Buffer(0), bufb, cbfactory3(bufb, function() {
        t.deepEqual(bufb, new Buffer(seedZeroHex, 'hex'));
      })));

      var buf2 = new Buffer(size + 2); buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(undefined, murmurHash('', buf2, 2, cbfactory3(buf2, function() {
        t.deepEqual(buf2, Buffer.concat([new Buffer([0,0]), new Buffer(seedZeroHex, 'hex')]));
      })));
      var buf2b = new Buffer(size + 2); buf2b.fill(0, 0, 2); buf2b.fill(-1, 2);
      t.strictEqual(undefined, murmurHash(new Buffer(0), buf2b, 2, cbfactory3(buf2b, function() {
        t.deepEqual(buf2b, Buffer.concat([new Buffer([0,0]), new Buffer(seedZeroHex, 'hex')]));
      })));

      var buf3 = new Buffer(size - 1); buf3.fill(-1);
      t.strictEqual(undefined, murmurHash('', buf3, -size, cbfactory3(buf3, function() {
        t.deepEqual(buf3, new Buffer(seedZeroHex, 'hex').slice(1));
      })));
      var buf3b = new Buffer(size - 1); buf3b.fill(-1);
      t.strictEqual(undefined, murmurHash(new Buffer(0), buf3b, -size, cbfactory3(buf3b, function() {
        t.deepEqual(buf3b, new Buffer(seedZeroHex, 'hex').slice(1));
      })));

      var bufpad = new Buffer(size - 3); bufpad.fill(-1);

      var buf4 = new Buffer(size + 2); buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(undefined, murmurHash('', buf4, 2, 3, cbfactory3(buf4, function() {
        t.deepEqual(buf4, Buffer.concat([new Buffer([0,0]),
                                         new Buffer(seedZeroHex, 'hex').slice(0, 3),
                                         bufpad]));
      })));
      var buf4b = new Buffer(size + 2); buf4b.fill(0, 0, 2); buf4b.fill(-1, 2);
      t.strictEqual(undefined, murmurHash(new Buffer(0), buf4b, 2, 3, cbfactory3(buf4b, function() {
        t.deepEqual(buf4b, Buffer.concat([new Buffer([0,0]),
                                       new Buffer(seedZeroHex, 'hex').slice(0, 3),
                                       bufpad]));
      })));

      var buf5 = new Buffer(size - 1); buf5.fill(-1);
      t.strictEqual(undefined, murmurHash('', buf5, -size, -3, cbfactory3(buf5, function() {
        t.deepEqual(buf5, Buffer.concat([new Buffer(seedZeroHex, 'hex').slice(size - 3 + 1),
                                         bufpad]));
      })));
      var buf5b = new Buffer(size - 1); buf5b.fill(-1);
      t.strictEqual(undefined, murmurHash(new Buffer(0), buf5b, -size, -3, cbfactory3(buf5b, function() {
        t.deepEqual(buf5b, Buffer.concat([new Buffer(seedZeroHex, 'hex').slice(size - 3 + 1),
                                         bufpad]));
      })));
    });

    t.test('should interpret 3[+2] arguments properly', function(t) {
      t.plan(16*4 + 18*5 + 10*4);
      function cbfactory(value) {
        return function(err, result) {
          t.error(err);
          t.strictEqual(typeof result, typeof value);
          if ('string' === typeof value) {
            t.strictEqual(result, value);
          } else {
            t.deepEqual(result, value);
          }
        }
      }
      function cbfactory2() {
        var args = [].slice.call(arguments, 0);
        return function(err, result) {
          t.error(err);
          args.push(function(err, result2) {
            t.error(err);
            t.strictEqual(typeof result, typeof result2);
            if ('string' === typeof result2) {
              t.strictEqual(result, result2);
            } else {
              t.deepEqual(result, result2);
            }
          });
          murmurHash.apply(this, args);
        }
      }
      function cbfactory3(value, cb) {
        return function(err, result) {
          t.error(err);
          t.strictEqual(result, value);
          cb();
        }
      }
      t.strictEqual(undefined, murmurHash('', -1, 0, cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash('', -1, null, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', -1, 'number', cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', -1, 'number', 1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', -1, 'buffer', cbfactory(new Buffer(seedMinusOneHex, 'hex'))));
      t.strictEqual(undefined, murmurHash('', -1, 'buffer', 1, cbfactory(new Buffer(seedMinusOneHex, 'hex'))));
      t.strictEqual(undefined, murmurHash('', 1, -1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', null, -1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, 0, cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, null, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, 'number', cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, 'number', 1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, 'buffer', cbfactory(new Buffer(seedMinusOneHex, 'hex'))));
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, 'buffer', 1, cbfactory(new Buffer(seedMinusOneHex, 'hex'))));
      t.strictEqual(undefined, murmurHash(new Buffer(0), 1, -1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), null, -1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8', 100,
                  cbfactory2(new Buffer('\u1234', 'utf8'), 100)));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), 'ignore', 100,
                  cbfactory2(new Buffer('\u1234', 'binary'), 100)));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8', 'buffer',
                    cbfactory2(new Buffer('\u1234', 'utf8'), 0, 'buffer')));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), 'buffer',
                    cbfactory2(new Buffer('\u1234', 'binary'), 0, 'buffer')));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8', 'buffer', -1,
                    cbfactory2(new Buffer('\u1234', 'utf8'), 0, 'buffer')));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), 'ignore', 'buffer', -1,
                    cbfactory2(new Buffer('\u1234', 'binary'), 0, 'buffer')));
      t.strictEqual(undefined, murmurHash('\u1234', null, 'buffer',
                    cbfactory2(new Buffer('\u1234', 'binary'), 0, 'buffer')));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), null, 'buffer',
                    cbfactory2(new Buffer('\u1234', 'binary'), 0, 'buffer')));
      t.strictEqual(undefined, murmurHash('\u1234', null, 'buffer', -1,
                    cbfactory2(new Buffer('\u1234', 'binary'), 0, 'buffer')));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), null, 'buffer', -1,
                    cbfactory2(new Buffer('\u1234', 'binary'), 0, 'buffer')));
      t.strictEqual(undefined, murmurHash('\u1234', null, null,
                  cbfactory2(new Buffer('\u1234', 'binary'), 0)));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), null, null,
                  cbfactory2(new Buffer('\u1234', 'binary'), 0)));
      t.strictEqual(undefined, murmurHash('\u1234', null, null, -1,
                  cbfactory2(new Buffer('\u1234', 'binary'), 0)));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), null, null, -1,
                  cbfactory2(new Buffer('\u1234', 'binary'), 0)));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8', null,
                  cbfactory2(new Buffer('\u1234', 'utf8'), 0)));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), 'ignore', null,
                  cbfactory2(new Buffer('\u1234', 'binary'), 0)));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8', null, -1,
                  cbfactory2(new Buffer('\u1234', 'utf8'), 0)));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), 'ignore', null, -1,
                  cbfactory2(new Buffer('\u1234', 'binary'), 0)));

      var buf = new Buffer(size); buf.fill(-1);
      t.strictEqual(undefined, murmurHash('', -1, buf, cbfactory3(buf, function() {
        t.deepEqual(buf, new Buffer(seedMinusOneHex, 'hex'));
      })));
      var bufb = new Buffer(size); bufb.fill(-1);
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, bufb, cbfactory3(bufb, function() {
        t.deepEqual(bufb, new Buffer(seedMinusOneHex, 'hex'));
      })));

      var buf2 = new Buffer(size + 2); buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(undefined, murmurHash('', -1, buf2, 2, cbfactory3(buf2, function() {
        t.deepEqual(buf2, Buffer.concat([new Buffer([0,0]), new Buffer(seedMinusOneHex, 'hex')]));
      })));
      var buf2b = new Buffer(size + 2); buf2b.fill(0, 0, 2); buf2b.fill(-1, 2);
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, buf2b, 2, cbfactory3(buf2b, function() {
        t.deepEqual(buf2b, Buffer.concat([new Buffer([0,0]), new Buffer(seedMinusOneHex, 'hex')]));
      })));

      var buf3 = new Buffer(size - 1); buf3.fill(-1);
      t.strictEqual(undefined, murmurHash('', -1, buf3, -size, cbfactory3(buf3, function() {
        t.deepEqual(buf3, new Buffer(seedMinusOneHex, 'hex').slice(1));
      })));
      var buf3b = new Buffer(size - 1); buf3b.fill(-1);
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, buf3b, -size, cbfactory3(buf3b, function() {
        t.deepEqual(buf3b, new Buffer(seedMinusOneHex, 'hex').slice(1));
      })));

      var bufpad = new Buffer(size - 3); bufpad.fill(-1);

      var buf4 = new Buffer(size + 2); buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(undefined, murmurHash('', -1, buf4, 2, 3, cbfactory3(buf4, function() {
        t.deepEqual(buf4, Buffer.concat([new Buffer([0,0]),
                                         new Buffer(seedMinusOneHex, 'hex').slice(0, 3),
                                         bufpad]));
      })));
      var buf4b = new Buffer(size + 2); buf4b.fill(0, 0, 2); buf4b.fill(-1, 2);
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, buf4b, 2, 3, cbfactory3(buf4b, function() {
        t.deepEqual(buf4b, Buffer.concat([new Buffer([0,0]),
                                       new Buffer(seedMinusOneHex, 'hex').slice(0, 3),
                                       bufpad]));
      })));

      var buf5 = new Buffer(size - 1); buf5.fill(-1);
      t.strictEqual(undefined, murmurHash('', -1, buf5, -size, -3, cbfactory3(buf5, function() {
        t.deepEqual(buf5, Buffer.concat([new Buffer(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                         bufpad]));
      })));
      var buf5b = new Buffer(size - 1); buf5b.fill(-1);
      t.strictEqual(undefined, murmurHash(new Buffer(0), -1, buf5b, -size, -3, cbfactory3(buf5b, function() {
        t.deepEqual(buf5b, Buffer.concat([new Buffer(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                         bufpad]));
      })));
    });

    t.test('should interpret 4[+2] arguments properly', function(t) {
      t.plan(18*4 + 20*5 + 10*4);
      function cbfactory(value) {
        return function(err, result) {
          t.error(err);
          t.strictEqual(typeof result, typeof value);
          if ('string' === typeof value) {
            t.strictEqual(result, value);
          } else {
            t.deepEqual(result, value);
          }
        }
      }
      function cbfactory2() {
        var args = [].slice.call(arguments, 0);
        return function(err, result) {
          t.error(err);
          args.push(function(err, result2) {
            t.error(err);
            t.strictEqual(typeof result, typeof result2);
            if ('string' === typeof result2) {
              t.strictEqual(result, result2);
            } else {
              t.deepEqual(result, result2);
            }
          });
          murmurHash.apply(this, args);
        }
      }
      function cbfactory3(value, cb) {
        return function(err, result) {
          t.error(err);
          t.strictEqual(result, value);
          cb();
        }
      }
      t.strictEqual(undefined, murmurHash('', 'utf8', -1, 0, cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash('', 'utf8', -1, null, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', 'utf8', -1, null, 1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', 'utf8', -1, 'number', cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', 'utf8', -1, 'number', 1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', 'utf8', -1, 'buffer', cbfactory(new Buffer(seedMinusOneHex, 'hex'))));
      t.strictEqual(undefined, murmurHash('', 'utf8', -1, 'buffer', 1, cbfactory(new Buffer(seedMinusOneHex, 'hex'))));
      t.strictEqual(undefined, murmurHash('', 'utf8', 1, -1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash('', 'utf8', null, -1, cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), 'utf8', -1, 0, cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), 'utf8', -1, null, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), 'utf8', -1, null, 1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), 'utf8', -1, 'number', cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), 'utf8', -1, 'number', 1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), 'utf8', -1, 'buffer', cbfactory(new Buffer(seedMinusOneHex, 'hex'))));
      t.strictEqual(undefined, murmurHash(new Buffer(0), 'utf8', -1, 'buffer', 1, cbfactory(new Buffer(seedMinusOneHex, 'hex'))));
      t.strictEqual(undefined, murmurHash(new Buffer(0), 'utf8', 1, -1, cbfactory(seedMinusOneDefault)));
      t.strictEqual(undefined, murmurHash(new Buffer(0), 'utf8', null, -1, cbfactory(seedZeroDefault)));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8', 100, 'buffer', 
                    cbfactory2(new Buffer('\u1234', 'utf8'), 100, 'buffer')));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), 'ignore', 100, 'buffer', 
                    cbfactory2(new Buffer('\u1234', 'binary'), 100, 'buffer')));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8', 100, 'buffer', -1, 
                    cbfactory2(new Buffer('\u1234', 'utf8'), 100, 'buffer')));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), 'ignore', 100, 'buffer', -1, 
                    cbfactory2(new Buffer('\u1234', 'binary'), 100, 'buffer')));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8', 0, 'buffer', 
                    cbfactory2(new Buffer('\u1234', 'utf8'), 'buffer')));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), 'ignore', 0, 'buffer', 
                    cbfactory2(new Buffer('\u1234', 'binary'), 'buffer')));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8', 0, 'buffer', -1, 
                    cbfactory2(new Buffer('\u1234', 'utf8'), 'buffer')));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), 'ignore', 0, 'buffer', -1, 
                    cbfactory2(new Buffer('\u1234', 'binary'), 'buffer')));
      t.strictEqual(undefined, murmurHash('\u1234', null, 1, 'buffer', 
                    cbfactory2(new Buffer('\u1234', 'binary'), 1, 'buffer')));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), null, 1, 'buffer', 
                    cbfactory2(new Buffer('\u1234', 'binary'), 1, 'buffer')));
      t.strictEqual(undefined, murmurHash('\u1234', null, 1, 'buffer', -1, 
                    cbfactory2(new Buffer('\u1234', 'binary'), 1, 'buffer')));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), null, 1, 'buffer', -1, 
                    cbfactory2(new Buffer('\u1234', 'binary'), 1, 'buffer')));
      t.strictEqual(undefined, murmurHash('\u1234', null, 1, null,
                    cbfactory2(new Buffer('\u1234', 'binary'), 1)));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), null, 1, null,
                    cbfactory2(new Buffer('\u1234', 'binary'), 1)));
      t.strictEqual(undefined, murmurHash('\u1234', null, 1, null, -1,
                    cbfactory2(new Buffer('\u1234', 'binary'), 1)));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), null, 1, null, -1,
                    cbfactory2(new Buffer('\u1234', 'binary'), 1)));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8', 1, null,
                    cbfactory2(new Buffer('\u1234', 'utf8'), 1)));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), 'ignore', 1, null,
                    cbfactory2(new Buffer('\u1234', 'binary'), 1)));
      t.strictEqual(undefined, murmurHash('\u1234', 'utf8', 1, null, -1,
                    cbfactory2(new Buffer('\u1234', 'utf8'), 1)));
      t.strictEqual(undefined, murmurHash(new Buffer('\u1234', 'binary'), 'ignore', 1, null, -1,
                    cbfactory2(new Buffer('\u1234', 'binary'), 1)));

      var buf = new Buffer(size); buf.fill(-1);
      t.strictEqual(undefined, murmurHash('', 'utf8', -1, buf, cbfactory3(buf, function() {
        t.deepEqual(buf, new Buffer(seedMinusOneHex, 'hex'));
      })));
      var bufb = new Buffer(size); bufb.fill(-1);
      t.strictEqual(undefined, murmurHash(new Buffer(0), '', -1, bufb, cbfactory3(bufb, function() {
        t.deepEqual(bufb, new Buffer(seedMinusOneHex, 'hex'));
      })));

      var buf2 = new Buffer(size + 2); buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(undefined, murmurHash('', 'binary', -1, buf2, 2, cbfactory3(buf2, function() {
        t.deepEqual(buf2, Buffer.concat([new Buffer([0,0]), new Buffer(seedMinusOneHex, 'hex')]));
      })));
      var buf2b = new Buffer(size + 2); buf2b.fill(0, 0, 2); buf2b.fill(-1, 2);
      t.strictEqual(undefined, murmurHash(new Buffer(0), '', -1, buf2b, 2, cbfactory3(buf2b, function() {
        t.deepEqual(buf2b, Buffer.concat([new Buffer([0,0]), new Buffer(seedMinusOneHex, 'hex')]));
      })));

      var buf3 = new Buffer(size - 1); buf3.fill(-1);
      t.strictEqual(undefined, murmurHash('', 'ascii', -1, buf3, -size, cbfactory3(buf3, function() {
        t.deepEqual(buf3, new Buffer(seedMinusOneHex, 'hex').slice(1));        
      })));
      var buf3b = new Buffer(size - 1); buf3b.fill(-1);
      t.strictEqual(undefined, murmurHash(new Buffer(0), '', -1, buf3b, -size, cbfactory3(buf3b, function() {
        t.deepEqual(buf3b, new Buffer(seedMinusOneHex, 'hex').slice(1));
      })));

      var bufpad = new Buffer(size - 3); bufpad.fill(-1);

      var buf4 = new Buffer(size + 2); buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(undefined, murmurHash('', 'ucs2', -1, buf4, 2, 3, cbfactory3(buf4, function() {
        t.deepEqual(buf4, Buffer.concat([new Buffer([0,0]),
                                         new Buffer(seedMinusOneHex, 'hex').slice(0, 3),
                                         bufpad]));
      })));
      var buf4b = new Buffer(size + 2); buf4b.fill(0, 0, 2); buf4b.fill(-1, 2);
      t.strictEqual(undefined, murmurHash(new Buffer(0), '', -1, buf4b, 2, 3, cbfactory3(buf4b, function() {
        t.deepEqual(buf4b, Buffer.concat([new Buffer([0,0]),
                                         new Buffer(seedMinusOneHex, 'hex').slice(0, 3),
                                         bufpad]));
      })));

      var buf5 = new Buffer(size - 1); buf5.fill(-1);
      t.strictEqual(undefined, murmurHash('', 'hex', -1, buf5, -size, -3, cbfactory3(buf5, function() {
        t.deepEqual(buf5, Buffer.concat([new Buffer(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                         bufpad]));
      })));
      var buf5b = new Buffer(size - 1); buf5b.fill(-1);
      t.strictEqual(undefined, murmurHash(new Buffer(0), '', -1, buf5b, -size, -3, cbfactory3(buf5b, function() {
        t.deepEqual(buf5b, Buffer.concat([new Buffer(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                         bufpad]));
      })));
    });

    t.test('should write hash into the same buffer it is reading from', function(t) {
      t.plan(6*5 + 5+12*2);
      function cbfactory(buf, cb) {
        return function(err, result) {
          t.error(err);
          t.strictEqual(result, buf);
          cb();
        }
      }
      function cbfactory2(buf, offs, len) {
        return function(err, result) {
          t.error(err);
          if (offs == undefined) {
            t.deepEqual(result, buf);
          } else {
            t.deepEqual(result.slice(offs, len), buf);
          }
          
        }
      }
      var data = '';
      for (var i = 0; i < 1000; ++i) data += String.fromCharCode((Math.random()*32768)|0);
      var databuf = new Buffer(data, 'utf8');
      var seed = (Math.random() * 0x100000000)|0;

      var buf = new Buffer(databuf.length + size); databuf.copy(buf); buf.fill(-1, databuf.length);
      t.strictEqual(undefined, murmurHash(buf.slice(0, databuf.length), seed, buf, databuf.length, cbfactory(buf, function() {
        t.strictEqual(undefined, murmurHash(data, 'utf8', seed, 'buffer', cbfactory2(buf.slice(databuf.length))));
        t.strictEqual(undefined, murmurHash(databuf, seed, 'buffer',      cbfactory2(buf.slice(databuf.length))));
      })));

      var buf2 = new Buffer(size + databuf.length); databuf.copy(buf2, size); buf2.fill(-1, 0, size);
      t.strictEqual(undefined, murmurHash(buf2.slice(size), seed, buf2, cbfactory(buf2, function() {
        t.strictEqual(undefined, murmurHash(data, 'utf8', seed, 'buffer', cbfactory2(buf2.slice(0, size))));
        t.strictEqual(undefined, murmurHash(databuf, seed, 'buffer',      cbfactory2(buf2.slice(0, size))));
      })));

      var buf3 = new Buffer(databuf.length); databuf.copy(buf3);
      t.strictEqual(undefined, murmurHash(buf3, seed, buf3, cbfactory(buf3, function() {
        t.strictEqual(undefined, murmurHash(data, 'utf8', seed, 'buffer', cbfactory2(buf3.slice(0, size))));
        t.strictEqual(undefined, murmurHash(databuf, seed, 'buffer',      cbfactory2(buf3.slice(0, size))));
        t.deepEqual(buf3.slice(size), databuf.slice(size));
      })));

      var buf4 = new Buffer(databuf.length); databuf.copy(buf4);
      t.strictEqual(undefined, murmurHash(buf4, seed, buf4, -size, cbfactory(buf4, function() {
        t.strictEqual(undefined, murmurHash(data, 'utf8', seed, 'buffer', cbfactory2(buf4.slice(databuf.length - size))));
        t.strictEqual(undefined, murmurHash(databuf, seed, 'buffer',      cbfactory2(buf4.slice(databuf.length - size))));
        t.deepEqual(buf4.slice(0, databuf.length - size), databuf.slice(0, databuf.length - size));
      })));

      var buf5 = new Buffer(databuf.length); databuf.copy(buf5);
      t.strictEqual(undefined, murmurHash(buf5, seed, buf5, 0, size - 1, cbfactory(buf5, function() {
        t.strictEqual(undefined, murmurHash(data, 'utf8', seed, 'buffer', cbfactory2(buf5.slice(0, size - 1), 0, size - 1)));
        t.strictEqual(undefined, murmurHash(databuf, seed, 'buffer', cbfactory2(buf5.slice(0, size - 1), 0, size - 1)));
        t.deepEqual(buf5.slice(size - 1), databuf.slice(size - 1));
      })));

      var buf6 = new Buffer(databuf.length); databuf.copy(buf6);
      t.strictEqual(undefined, murmurHash(buf6, seed, buf6, -size, -size + 2, cbfactory(buf6, function() {
        t.strictEqual(undefined, murmurHash(data, 'utf8', seed, 'buffer', 
                      cbfactory2(buf6.slice(databuf.length - size, databuf.length - 2), 2)));
        t.strictEqual(undefined, murmurHash(databuf, seed, 'buffer', 
                      cbfactory2(buf6.slice(databuf.length - size, databuf.length - 2), 2)));
        t.deepEqual(buf6.slice(0, databuf.length - size), databuf.slice(0, databuf.length - size));
        t.deepEqual(buf6.slice(databuf.length - 2), databuf.slice(databuf.length - 2));
      })));
    });

    t.end();
  });

});