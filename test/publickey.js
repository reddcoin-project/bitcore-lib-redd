'use strict';

const should = require('chai').should();
const expect = require('chai').expect;
const sinon = require('sinon');

const bitcore = require('..');
const Point = bitcore.crypto.Point;
const BN = bitcore.crypto.BN;
const PublicKey = bitcore.PublicKey;
const PrivateKey = bitcore.PrivateKey;
const Address = bitcore.Address;
const Networks = bitcore.Networks;

/* jshint maxlen: 200 */

describe('PublicKey', function() {
  /* jshint maxstatements: 30 */

  afterEach(function() {
    sinon.restore();
  });

  const invalidPoint = '0400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

  describe('validating errors on creation', function() {
    it('errors if data is missing', function() {
      (function() {
        return new PublicKey();
      }).should.throw('First argument is required, please include public key data.');
    });

    it('errors if an invalid point is provided', function() {
      (function() {
        return new PublicKey(invalidPoint);
      }).should.throw('Point does not lie on the curve');
    });

    it('errors if a point not on the secp256k1 curve is provided', function() {
      (function() {
        return new PublicKey(new Point(1000, 1000));
      }).should.throw('Point does not lie on the curve');
    });

    it('errors if the argument is of an unrecognized type', function() {
      (function() {
        return new PublicKey(new Error());
      }).should.throw('First argument is an unrecognized data format.');
    });
  });

  describe('instantiation', function() {

    it('from a private key', function() {
      var privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
      var pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc';
      var privkey = new PrivateKey(new BN(Buffer.from(privhex, 'hex')));
      var pk = new PublicKey(privkey);
      pk.toString().should.equal(pubhex);
    });

    it('problematic secp256k1 public keys', function() {

      var knownKeys = [
        {
          wif: 'V2FCCg18BDPHrUqmNuZjTnrnLfA2UcyMG3F5WcwXA3CTfEriR21J',
          priv: '6d1229a6b24c2e775c062870ad26bc261051e0198c67203167273c7c62538846',
          pub: '03d6106302d2698d6a41e9c9a114269e7be7c6a0081317de444bb2980bf9265a01',
          pubx: 'd6106302d2698d6a41e9c9a114269e7be7c6a0081317de444bb2980bf9265a01',
          puby: 'e05fb262e64b108991a29979809fcef9d3e70cafceb3248c922c17d83d66bc9d'
        },
        {
          wif: 'V6j9KnM3hnzVPk5fbRju15g7S8GPgaEkHCVcBc9yjqEDwL3pWzeL',
          priv: 'f2cc9d2b008927db94b89e04e2f6e70c180e547b3e5e564b06b8215d1c264b53',
          pub: '03e275faa35bd1e88f5df6e8f9f6edb93bdf1d65f4915efc79fd7a726ec0c21700',
          pubx: 'e275faa35bd1e88f5df6e8f9f6edb93bdf1d65f4915efc79fd7a726ec0c21700',
          puby: '367216cb35b086e6686d69dddd822a8f4d52eb82ac5d9de18fdcd9bf44fa7df7'
        }
      ];

      for(var i = 0; i < knownKeys.length; i++) {
        var privkey = new PrivateKey(knownKeys[i].wif);
        var pubkey = privkey.toPublicKey();
        pubkey.toString().should.equal(knownKeys[i].pub);
        pubkey.point.x.toString('hex').should.equal(knownKeys[i].pubx);
        pubkey.point.y.toString('hex').should.equal(knownKeys[i].puby);
      }

    });

    it('from a compressed public key', function() {
      var publicKeyHex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      var publicKey = new PublicKey(publicKeyHex);
      publicKey.toString().should.equal(publicKeyHex);
    });

    it('from another publicKey', function() {
      var publicKeyHex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      var publicKey = new PublicKey(publicKeyHex);
      var publicKey2 = new PublicKey(publicKey);
      publicKey.should.equal(publicKey2);
    });

    it('sets the network to defaultNetwork if none provided', function() {
      var publicKeyHex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      var publicKey = new PublicKey(publicKeyHex);
      publicKey.network.should.equal(Networks.defaultNetwork);
    });

    it('from a hex encoded DER string', function() {
      var pk = new PublicKey('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      should.exist(pk.point);
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

    it('from a hex encoded DER buffer', function() {
      var pk = new PublicKey(Buffer.from('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341', 'hex'));
      should.exist(pk.point);
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

    it('from a point', function() {
      var p = new Point('86a80a5a2bfc48dddde2b0bd88bd56b0b6ddc4e6811445b175b90268924d7d48',
                        '3b402dfc89712cfe50963e670a0598e6b152b3cd94735001cdac6794975d3afd');
      var a = new PublicKey(p);
      should.exist(a.point);
      a.point.toString().should.equal(p.toString());
      var c = new PublicKey(p);
      should.exist(c.point);
      c.point.toString().should.equal(p.toString());
    });
  });


  describe('#getValidationError', function(){

    it('should recieve an invalid point error', function() {
      var error = PublicKey.getValidationError(invalidPoint);
      should.exist(error);
      error.message.should.equal('Point does not lie on the curve');
    });

    it('should recieve a boolean as false', function() {
      var valid = PublicKey.isValid(invalidPoint);
      valid.should.equal(false);
    });

    it('should recieve a boolean as true for uncompressed', function() {
      var valid = PublicKey.isValid('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      valid.should.equal(true);
    });

    it('should recieve a boolean as true for compressed', function() {
      var valid = PublicKey.isValid('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      valid.should.equal(true);
    });

  });

  describe('#fromPoint', function() {

    it('should instantiate from a point', function() {
      var p = new Point('86a80a5a2bfc48dddde2b0bd88bd56b0b6ddc4e6811445b175b90268924d7d48',
                        '3b402dfc89712cfe50963e670a0598e6b152b3cd94735001cdac6794975d3afd');
      var b = PublicKey.fromPoint(p);
      should.exist(b.point);
      b.point.toString().should.equal(p.toString());
    });

    it('should error because paramater is not a point', function() {
      (function() {
        PublicKey.fromPoint(new Error());
      }).should.throw('First argument must be an instance of Point.');
    });
  });

  describe('#json/object', function() {

    it('should input/ouput json', function() {
      var json = JSON.stringify({
        x: '1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a',
        y: '7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341',
        compressed: false
      });
      var pubkey = new PublicKey(JSON.parse(json));
      JSON.stringify(pubkey).should.deep.equal(json);
    });

    it('fails if "y" is not provided', function() {
      expect(function() {
        return new PublicKey({
          x: '1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a'
        });
      }).to.throw();
    });

    it('fails if invalid JSON is provided', function() {
      expect(function() {
        return PublicKey._transformJSON('¹');
      }).to.throw();
    });

    it('works for X starting with 0x00', function() {
      var a = new PublicKey('030589ee559348bd6a7325994f9c8eff12bd5d73cc683142bd0dd1a17abc99b0dc');
      var b = new PublicKey('03'+a.toObject().x);
      b.toString().should.equal(a.toString());
    });

  });

  describe('#fromPrivateKey', function() {

    it('should make a public key from a privkey', function() {
      should.exist(PublicKey.fromPrivateKey(PrivateKey.fromRandom()));
    });

    it('should error because not an instance of privkey', function() {
      (function() {
        PublicKey.fromPrivateKey(new Error());
      }).should.throw('Must be an instance of PrivateKey');
    });

  });

  describe('#fromBuffer', function() {

    it('should parse this uncompressed public key', function() {
      var pk = PublicKey.fromBuffer(Buffer.from('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341', 'hex'));
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    it('should parse this compressed public key', function() {
      var pk = PublicKey.fromBuffer(Buffer.from('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    it('should throw an error on this invalid public key', function() {
      (function() {
        PublicKey.fromBuffer(Buffer.from('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      }).should.throw();
    });

    it('should throw error because not a buffer', function() {
      (function() {
        PublicKey.fromBuffer('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      }).should.throw('Must be a hex buffer of DER encoded public key');
    });

    it('should throw error because buffer is the incorrect length', function() {
      (function() {
        PublicKey.fromBuffer(Buffer.from('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a34112', 'hex'));
      }).should.throw('Length of x and y must be 32 bytes');
    });

  });

  describe('#fromDER', function() {

    it('should parse this uncompressed public key', function() {
      var pk = PublicKey.fromDER(Buffer.from('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341', 'hex'));
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    it('should parse this compressed public key', function() {
      var pk = PublicKey.fromDER(Buffer.from('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    it('should throw an error on this invalid public key', function() {
      (function() {
        PublicKey.fromDER(Buffer.from('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      }).should.throw();
    });

  });

  describe('#fromString', function() {

    it('should parse this known valid public key', function() {
      var pk = PublicKey.fromString('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

  });

  describe('#fromX', function() {

    it('should create this known public key', function() {
      var x = BN.fromBuffer(Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      var pk = PublicKey.fromX(true, x);
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });


    it('should error because odd was not included as a param', function() {
      var x = BN.fromBuffer(Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      (function() {
        return PublicKey.fromX(null, x);
      }).should.throw('Must specify whether y is odd or not (true or false)');
    });

  });

  describe('#toBuffer', function() {

    it('should return this compressed DER format', function() {
      var x = BN.fromBuffer(Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      var pk = PublicKey.fromX(true, x);
      pk.toBuffer().toString('hex').should.equal('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

    it('should return this uncompressed DER format', function() {
      var x = BN.fromBuffer(Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      var pk = PublicKey.fromX(true, x);
      pk.toBuffer().toString('hex').should.equal('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

  });

  describe('#toDER', function() {

    it('should return this compressed DER format', function() {
      var x = BN.fromBuffer(Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      var pk = PublicKey.fromX(true, x);
      pk.toDER().toString('hex').should.equal('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

    it('should return this uncompressed DER format', function() {
      var pk = PublicKey.fromString('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      pk.toDER().toString('hex').should.equal('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });
  });

  describe('#toAddress', function() {

    it('should output this known mainnet address correctly', function() {
      var pk = new PublicKey('03c87bd0e162f26969da8509cafcb7b8c8d202af30b928c582e263dd13ee9a9781');
      var address = pk.toAddress('livenet');
      address.toString().should.equal('Rhihwe566V6TKfucrSPLTsJ1TiL8jXSTLr');
    });

    it('should output this known testnet address correctly', function() {
      var pk = new PublicKey('0293126ccc927c111b88a0fe09baa0eca719e2a3e087e8a5d1059163f5c566feef');
      var address = pk.toAddress('testnet');
      address.toString().should.equal('mtX8nPZZdJ8d3QNLRJ1oJTiEi26Sj6LQXS');
    });

    it('should output this known mainnet witness address correctly', function() {
      var pk = new PublicKey('03c87bd0e162f26969da8509cafcb7b8c8d202af30b928c582e263dd13ee9a9781');
      var address = pk.toAddress('livenet', Address.PayToWitnessPublicKeyHash);
      address.toString().should.equal('rdd1qv0t45lutg37ghyg7lg22vgducs3d9hvuptmtfr');
    });

    it('should output this known testnet witness address correctly', function() {
      var pk = new PublicKey('0293126ccc927c111b88a0fe09baa0eca719e2a3e087e8a5d1059163f5c566feef');
      var address = pk.toAddress('testnet', Address.PayToWitnessPublicKeyHash);
      address.toString().should.equal('trdd1q363x8lv54fdsywyc9494upd6sp4rg6glkvfsss');
    });

    it('should output this known mainnet wrapped witness address correctly', function() {
      var pk = new PublicKey('03c87bd0e162f26969da8509cafcb7b8c8d202af30b928c582e263dd13ee9a9781');
      var address = pk.toAddress('livenet', Address.PayToScriptHash);
      address.toString().should.equal('39wREM7dxb7KNMNR1py1W8nUheUtkPPA5r');
    });

    it('should output this known testnet wrapped witness address correctly', function() {
      var pk = new PublicKey('0293126ccc927c111b88a0fe09baa0eca719e2a3e087e8a5d1059163f5c566feef');
      var address = pk.toAddress('testnet', Address.PayToScriptHash);
      address.toString().should.equal('2NDgQSsQGdLDGoYvh4NTmesQ2wWgx6RGu3m');
    });

  });

  describe('hashes', function() {

    // wif private key, address
    // see: https://github.com/bitcoin/bitcoin/blob/master/src/test/key_tests.cpp#L20
    var data = [
      ['7LXvh53raendmbGTMFAi7fF51gnxNxXsHfDKSsEyJjfNcng88gs', 'RwsdtyenP5pvvpoWoAD1trUQAW3zXeb4fu'],
      ['7MmUQtEAisFtFHixgPz3fmawtL7QjHA5SMJUtvEeeTft48XHVgj', 'Rnhm8rFpfcLzt4pAfk1nA8F3S2wVZF833B'],
      ['UyDVyrsbqXnRHpFDJMXrUPo6i2dqRv7ExXfNRAkfXHJNQfjjfq4i', 'RvR6vS4TGPSmYdoBo7mVsEEJFJ8mUyWVEh'],
      ['V4fHzR77unphC4pCktSnn7nqFZMHjcK4atcA89yFALicLj1iU3FZ', 'Rk3X5v9vKCnxsifoq1D9qzag59AgtRa2pN']
    ];

    data.forEach(function(d){
      var publicKey = PrivateKey.fromWIF(d[0]).toPublicKey();
      var address = Address.fromString(d[1]);
      address.hashBuffer.should.deep.equal(publicKey._getID());
    });

  });

  describe('#toString', function() {

    it('should print this known public key', function() {
      var hex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      var pk = PublicKey.fromString(hex);
      pk.toString().should.equal(hex);
    });

  });

  describe('#inspect', function() {
    it('should output known uncompressed pubkey for console', function() {
      var pubkey = PublicKey.fromString('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      pubkey.inspect().should.equal('<PublicKey: 041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341, uncompressed>');
    });

    it('should output known compressed pubkey for console', function() {
      var pubkey = PublicKey.fromString('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pubkey.inspect().should.equal('<PublicKey: 031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a>');
    });

    it('should output known compressed pubkey with network for console', function() {
      var privkey = PrivateKey.fromWIF('V5SvJqWB8S8NqNfm5qMDaZitaojky7iYfMqd3Sua2wCfbhM7AyGh');
      var pubkey = new PublicKey(privkey);
      pubkey.inspect().should.equal('<PublicKey: 0349b9b998d0e7c11fb3442739722aaffdb21cea5849041987c77d789b789506da>');
    });

  });

  describe('#validate', function() {

    it('should not have an error if pubkey is valid', function() {
      var hex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      expect(function() {
        return PublicKey.fromString(hex);
      }).to.not.throw();
    });

    it('should throw an error if pubkey is invalid', function() {
      var hex = '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a0000000000000000000000000000000000000000000000000000000000000000';
      (function() {
        return PublicKey.fromString(hex);
      }).should.throw('Invalid y value for curve.');
    });

    it('should throw an error if pubkey is invalid', function() {
      var hex = '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a00000000000000000000000000000000000000000000000000000000000000FF';
      (function() {
        return PublicKey.fromString(hex);
      }).should.throw('Invalid y value for curve.');
    });

    it('should throw an error if pubkey is infinity', function() {
      (function() {
        return new PublicKey(Point.getG().mul(Point.getN()));
      }).should.throw('Point cannot be equal to Infinity');
    });

  });

  describe('#isValidTaproot', function() {
    const TAPROOT_VALID_HEX = '29b21ed3959615c97d0866a295486c25577aaa5ee18d463489d9dbe3cf0aaf5e';
    const TAPROOT_INVALID_HEX = TAPROOT_VALID_HEX.slice(0, -1) + 'g'; // g is not a valid hex character
    const INVALID_X = 'bca10d4006dbfebe31eee345df1d18d738f72fcd62d6ccafa84f87f05bac3467';

    it('should be true - hex string', function() {
      const isValid = PublicKey.isValidTaproot(TAPROOT_VALID_HEX);
      isValid.should.equal(true);
    });

    it('should be true - buffer', function() {
      const isValid = PublicKey.isValidTaproot(Buffer.from(TAPROOT_VALID_HEX, 'hex'));
      isValid.should.equal(true);
    });

    it('should be false - invalid X - hex string', function() {
      sinon.spy(PublicKey, 'fromX');
      const isValid = PublicKey.isValidTaproot(INVALID_X);
      isValid.should.equal(false);
      PublicKey.fromX.callCount.should.equal(1);
      PublicKey.fromX.getCall(0).exception.message.should.equal('Invalid X');
    });

    it('should be false - invalid X - buffer', function() {
      sinon.spy(PublicKey, 'fromX');
      const isValid = PublicKey.isValidTaproot(Buffer.from(INVALID_X, 'hex'));
      isValid.should.equal(false);
      PublicKey.fromX.callCount.should.equal(1);
      PublicKey.fromX.getCall(0).exception.message.should.equal('Invalid X');
    });

    it('should be false - invalid length', function() {
      const isValid = PublicKey.isValidTaproot(TAPROOT_VALID_HEX.slice(0, -1));
      isValid.should.equal(false);
    });

    it('should be false - invalid hex', function() {
      const isValid = PublicKey.isValidTaproot(TAPROOT_INVALID_HEX);
      isValid.should.equal(false);
    });
  });

});
