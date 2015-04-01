var _ = require('underscore'),
    AWS = require('aws-sdk'),
    util = require('util'),
    async = require('async'),
    mime = require('mime-types'),
    replaceAll = require('underscore.string/replaceAll'),
    path = require('path'),
    BaseService = require('../base'),
    aws = require('../../../config/aws');

function S3Service(config) {
  AWS.config.update(aws.credentials);
  this.s3 = new AWS.S3();
  this.config = _.defaults(aws.service, config);
}
S3Service.prototype = Object.create(BaseService.prototype);
S3Service.prototype.constructor = S3Service;

S3Service.prototype.normalize_key = function(key, index) {
  if( Array.isArray(key) ) {
    key = _.map(key, function(part) {
      if( index && (''+part).substr(0,1) !== '/' ) { return '/' + part; }
      return part;
    });
    return path.normalize(replaceAll(key.join(''), '[\.]{2}', ''));
  }

  if( typeof key === 'string' ) {
    return path.normalize(replaceAll(key, '[\.]{2}', ''));
  }

  return '';
};

S3Service.prototype.getObject = function(options, callback) {
  options = options || {};
  options.Bucket = this.config.bucket;

  if( options.Key ) { options.Key = this.normalize_key(options.Key); }

  if( !callback ) { return this.s3.getObject(options); }

  return this.s3.getObject(options, callback);
};

S3Service.prototype.headObject = function(options, callback) {
  options = options || {};
  options.Bucket = this.config.bucket;

  if( options.Key ) { options.Key = this.normalize_key(options.Key); }

  if( !callback ) { return this.s3.headObject(options); }

  return this.s3.headObject(options, callback);
};

S3Service.prototype.putObject = function(options, callback) {
  options = options || {};
  options.Bucket = this.config.bucket;

  if( options.Key ) { options.Key = this.normalize_key(options.Key); }

  if( !callback ) { return this.s3.putObject(options); }

  return this.s3.putObject(options, callback);
};

S3Service.prototype.copyObject = function(options, callback) {
  options = options || {};
  options.Bucket = this.config.bucket;

  if( options.Key ) { options.Key = this.normalize_key(options.Key); }

  if( !callback ) { return this.s3.copyObject(options); }

  return this.s3.copyObject(options, callback);
};

S3Service.prototype.deleteObject = function(options, callback) {
  options = options || {};
  options.Bucket = this.config.bucket;

  if( options.Key ) { options.Key = this.normalize_key(options.Key); }

  if( !callback ) { return this.s3.deleteObject(options); }

  return this.s3.deleteObject(options, callback);
};

S3Service.prototype.deleteObjects = function(options, callback) {
  options = options || {};
  options.Bucket = this.config.bucket;

  if( options.Key ) { options.Key = this.normalize_key(options.Key); }

  if( !callback ) { return this.s3.deleteObjects(options); }

  return this.s3.deleteObjects(options, callback);
};

S3Service.prototype.listObjects = function(options, callback) {
  options = options || {};
  options.Bucket = this.config.bucket;

  if( options.Key ) { options.Key = this.normalize_key(options.Key); }

  if( !callback ) { return this.s3.listObjects(options); }

  return this.s3.listObjects(options, callback);
};

module.exports = S3Service;
