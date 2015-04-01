var FileSchema = require('../../models/file'),
    templo = require('templo'),
    templates = require('./templates/file'),
    _ = require('underscore'),
    util = require('util'),
    async = require('async'),
    mime = require('mime-types'),
    BaseService = require('../base'),
    S3Service = require('../s3/s3');

var MONGO_DUP_KEY = 11000;

function FileService(options) {
  this.model = options.db.model('File');
  this.s3 = new S3Service({
    bucket: 'bloks'
  });
}
FileService.prototype = Object.create(BaseService.prototype);
FileService.prototype.constructor = FileService;

FileService.prototype.list = function(params, callback) {
  var self = this,
      fields,
      hidden;

  try {
    params = self.validate_params(templates.list_params, params, self.FileServiceError);
    fields = params.fields;
    hidden = params.hidden;
    delete params.fields;
    delete params.hidden;
  } catch(e) {
    return callback(e, null);
  }

  this.model.find(params, function(err, files) {
    if( err ) { return callback( new self.FileServiceError({ status: 500 }), null ); }

    var output = [];

    _.each(files, function(file) {
      if( hidden || (!hidden && file.name.substr(0,1) !== '.') ) {
        var file_json = {};

        _.each(fields.split(' '), function(field) {
          file_json[field] = file[field];
        });

        output.push(file_json);
      }
    });

    return callback( null, output );
  });
};

FileService.prototype.content = function(params, callback) {
  var self = this,
      req;

  try {
    params = self.validate_params(templates.show_params, params, self.FileServiceError);
  } catch(e) {
    return callback(e, null);
  }

  this.model.findOne(params, function(err, file) {
    if( err ) { return callback( new self.FileServiceError({ status: 500 }), null ); }
    if( !file ) { return callback( new self.FileServiceError({ status: 404 }), null); }

    req = self.s3.getObject({ Key: [params.project_id, params.path, params.name] });

    return callback(null, {
      req: req,
      stream: req.createReadStream()
    });
  });
};

FileService.prototype.find = function(params, callback) {
  var self = this;

  try {
    params = self.validate_params(templates.show_params, params, self.FileServiceError);
  } catch(e) {
    return callback( new self.FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
  }

  this.model.findOne(params, function(err, file) {
    if( err ) { return callback( new self.FileServiceError({ status: 500 }), null ); }
    if( !file ) { return callback( new self.FileServiceError({ status: 404 }), null); }

    file = file.toJSON();
    file.full_path = file.path + file.name;

    try {
      return callback( null, self.parse_response(templates.show, file) );
    } catch(e) {
      return callback( new self.FileServiceError({ status: 500, errors: e.errors, warnings: e.warnings }), null);
    }
  });
};

FileService.prototype.create = function(data, callback) {
  var self = this,
      full_path;

  try {
    data = self.validate_params(templates.create, data, self.FileServiceError);
  } catch(e) {
    return callback(new self.FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
  }

  full_path = [data.project_id, data.path, data.name].join('');
  data.size = 0;
  data.mime = data.type === 'file' ? mime.lookup(data.name) || 'text/plain' : 'text/directory';
  data.created_at = Date.now();

  this.model.create(data, function(err, file) {
    if( err && err.code === MONGO_DUP_KEY ) { return callback( new self.FileServiceError({ status: 422, message: 'File already exists.', err: 'FILE_ALREADY_EXISTS' }), null); }
    if( err ) { return callback( new self.FileServiceError({ status: 500 }), null); }

    file = file.toJSON();
    file.full_path = file.path + file.name;

    self.s3.headObject({
      Key: file.type === 'dir' ? full_path + '/' : full_path
    }, function(err, res) {
      if( err && err.statusCode !== 404 ) { return callback(new self.FileServiceError({ status: 500, message: err.message }), null); }
      if( !err ) { return callback(new self.FileServiceError({ status: 422, message: 'File already exists.', err: 'FILE_ALREADY_EXISTS' }), null); }

      self.s3.putObject({
        Key: full_path + (file.type === 'dir' ? '/' : ''),
        Body: '',
        ACL: 'private',
        ContentType: file.mime
      }, function(err, res) {
        if( err ) { return callback(new self.FileServiceError({ status: 500 }), null); }

        return callback( null, self.parse_response(templates.show, file) );
      });
    });
  });
};

FileService.prototype.create_with_content = function(params, data, callback) {
  var self = this,
      full_path;

  try {
    params = self.validate_params(templates.create_with_content_params, params, self.FileServiceError);
  } catch(e) {
    return callback( new self.FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
  }

  full_path = [params.project_id, params.path, params.name].join('');
  params.size = data.length;
  params.mime = params.type === 'file' ? mime.lookup(params.name) || 'text/plain' : 'text/directory';
  params.created_at = Date.now();

  this.model.create(params, function(err, file) {
    if( err && err.code === MONGO_DUP_KEY ) { return callback( new self.FileServiceError({ status: 422, message: 'File already exists.', err: 'FILE_ALREADY_EXISTS' }), null); }
    if( err ) { return callback( new self.FileServiceError({ status: 500 }), null); }

    file = file.toJSON();
    file.full_path = file.path + file.name;

    self.s3.headObject({
      Key: file.type === 'dir' ? full_path + '/' : full_path
    }, function(err, res) {
      if( err && err.statusCode !== 404 ) { return callback(new self.FileServiceError({ status: 500 }), null); }
      if( !err ) { return callback(new self.FileServiceError({ status: 422, message: 'File already exists.', err: 'FILE_ALREADY_EXISTS' }), null); }

      self.s3.putObject({
        Key: full_path + (file.type === 'dir' ? '/' : ''),
        Body: data,
        ACL: 'private',
        ContentType: mime.contentType(file.mime)
      }, function(err, res) {
        if( err ) { console.dir(err); return callback(new self.FileServiceError({ status: 500 }), null); }

        return callback( null, self.parse_response(templates.show, file) );
      });
    });
  });
};

FileService.prototype.update = function(params, data, callback) {
  var self = this;

  try {
    params = self.validate_params(templates.update_params, params, self.FileServiceError);
    data = self.validate_params(templates.update, data, self.FileServiceError);
  } catch(e) {
    return callback( new self.FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
  }

  self.model.findOne(params, function(err, file) {
    if( err ) { return callback( new self.FileServiceError({ status: 500 }), null); }
    if( !file ) { return callback( new self.FileServiceError({ status: 404 }), null); }

    data.type = file.type; // Type can't be modified
    data.mime = data.type === 'file' ? mime.lookup(data.name) || 'text/plain' : 'text/directory';

    self.model.findByIdAndUpdate(file._id, data, function(err, updated_file) {
      if( err ) { return callback( new self.FileServiceError({ status: 500 }), null); }

      updated_file = updated_file.toJSON();
      updated_file.full_path = updated_file.path + updated_file.name;

      if( updated_file.full_path !== file.path + file.name ) {
        self.s3.copyObject({
          CopySource: self.s3.config.bucket + '/' + file.project_id + file.path + file.name + (file.type === 'dir' ? '/' : ''),
          Key: updated_file.project_id + updated_file.full_path + (updated_file.type === 'dir' ? '/' : ''),
          MetadataDirective: 'COPY'
        }, function(err, res) {
          if( err ) { return callback(new self.FileServiceError({ status: 500 }), null); }

          self.s3.deleteObject({
            Key: file.project_id + file.path + file.name + (file.type === 'dir' ? '/' : '')
          }, function(err, res) {
            if( err ) { return callback(new self.FileServiceError({ status: 500 }), null); }

            return callback( null, self.parse_response(templates.show, updated_file) );
          });
        });
      } else {
        self.s3.putObject({
          Key: updated_file.project_id + updated_file.full_path + (updated_file.type === 'dir' ? '/' : ''),
          ContentType: mime.contentType(data.mime)
        }, function(err, res) {
          if( err ) { return callback(new self.FileServiceError({ status: 500 }), null); }

          return callback( null, self.parse_response(templates.show, updated_file) );
        });
      }
    });
  });
};

FileService.prototype.update_content = function(params, data, callback) {
  var self = this,
      full_path;

  try {
    params = self.validate_params(templates.update_params, params, self.FileServiceError);
  } catch(e) {
    return callback( new self.FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
  }

  full_path = [params.project_id, params.path, params.name].join('');

  self.model.findOneAndUpdate(params, { size: data.length || 0 }, function(err, file) {
    if( err ) { return callback( new self.FileServiceError({ status: 500 }), null); }
    if( !file ) { return callback( new self.FileServiceError({ status: 422, message: 'File doesn\'t exist.', err: 'FILE_DOES_NOT_EXIST' }), null); }

    file = file.toJSON();
    file.full_path = params.path + params.name;

    self.s3.headObject({
      Key: full_path
    }, function(err, res) {
      if( err && err.statusCode === 404 ) { return callback(new self.FileServiceError({ status: 422, message: 'File doesn\'t exist.', err: 'FILE_DOES_NOT_EXIST' }), null); }
      if( err ) { return callback(new self.FileServiceError({ status: 500 }), null); }

      self.s3.putObject({
        Key: full_path,
        Body: data,
        ACL: 'private',
        ContentType: mime.contentType(mime.lookup(params.name) || 'text/plain')
      }, function(err, res) {
        if( err ) { return callback(new self.FileServiceError({ status: 500 }), null); }

        return callback( null, self.parse_response(templates.show, file) );
      });
    });
  });
};

FileService.prototype.remove = function(params, callback) {
  var self = this,
      full_path,
      query;

  try {
    params = self.validate_params(templates.remove_params, params, self.FileServiceError);
  } catch(e) {
    return callback( new self.FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
  }

  if( params.name.slice(-1) === '/' ) {
    query = self.model.find();

    query.where({ path: new RegExp('^'+params.path+params.name, 'i') });
    query.exec(function(err, files) {
      if( err ) { return callback(new self.FileServiceError({ status: 500 }), null); }
      if( files && !files.length ) { return callback(new self.FileServiceError({ status: 404, message: 'File not found.', err: 'FILE_NOT_EXISTS' }), null); }

      self.s3.listObjects({
        Prefix: params.project_id+params.path+params.name
      }, function(err, res) {
        if( err ) { return callback(new self.FileServiceError({ status: 500 }), null); }

        if( res.Contents.length ) {
          var objects = _.map(res.Contents, function(object) {
            return {
              Key: object.Key
            };
          });

          self.s3.deleteObjects({
            Delete: {
              Objects: objects
            }
          }, function(err, res) {
            if( err ) { console.dir(err);return callback(new self.FileServiceError({ status: 500 }), null); }

            query.remove(function(err) {
              if( err ) { return callback(new self.FileServiceError({ status: 500 }), null); }

              return callback(null, {
                status: 200,
                message: 'Files deleted succesfully'
              });
            });
          });
        } else {
          return callback(null, {
            status: 200,
            message: 'Files deleted succesfully'
          });
        }
      });
    });

    return;
  }

  self.model.findOneAndRemove(params, function(err, file) {
    if( err ) { return callback(new self.FileServiceError({ status: 500 }), null); }
    if( !file ) { return callback(new self.FileServiceError({ status: 404, message: 'File not found.', err: 'FILE_NOT_EXISTS' }), null); }

    full_path = [params.project_id, params.path, params.name].join('');

    self.s3.deleteObject({
      Key: full_path + (file.type === 'dir' ? '/' : '')
    }, function(err, res) {
      if( err ) { return callback(new self.FileServiceError({ status: 500 }), null); }

      return callback(null, {
        status: 200,
        message: 'File deleted succesfully'
      });
    });
  });
};

/**
 * Custom Error for the service. It allows a status and details about warnings
 * and errors you want to communicate.
 *
 * @param {Object} [options] - A hash of options, i.e. status, message, warnings, etc.
 */
FileService.prototype.FileServiceError = function(options) {
  options = _.defaults(options, {
    subject: 'file'
  });

  this.name = 'FileServiceError';
  if( options.err ) { this.err = options.err; }
  BaseService.ServiceError.call(this, options);
};
FileService.prototype.FileServiceError.prototype = Object.create(Error.prototype);
FileService.prototype.FileServiceError.prototype.constructor = FileService.prototype.FileServiceError;

module.exports = FileService;
