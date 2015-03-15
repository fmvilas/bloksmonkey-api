/*
 * TODO: This file needs a huge refactor!
 */

var FileSchema = require('../../models/file'),
    templo = require('templo'),
    templates = require('./templates/file'),
    _ = require('underscore'),
    AWS = require('aws-sdk'),
    util = require('util'),
    async = require('async'),
    mime = require('mime-types'),
    s3;

var MONGO_DUP_KEY = 11000;

AWS.config.loadFromPath('./config/aws.js');
s3 = new AWS.S3();

/**
 * Custom Error for the service. It allows a status and details about warnings
 * and errors you want to communicate.
 *
 * @param {Object} [options] - A hash of options, i.e. status, message, warnings, etc.
 */
function FileServiceError(options) {
    options = options || {};
    this.status = options.status || 500;
    this.name = 'FileServiceError';

    if( options.message ) {
        this.message = options.message;
    } else {
        switch(this.status) {
            case 404:
                this.message = 'File not found';
                break;
            case 422:
                this.message = 'Unprocessable entity.';
                break;
            case 500:
            default:
                this.message = 'Unexpected Error';
                break;
        }

        this.message = 'Error ' + this.status + ': ' + this.message + '.';
    }

    if( options.err ) { this.err = options.err; }
    if( options.warnings ) { this.warnings = options.warnings; }
    if( options.errors ) { this.errors = options.errors; }
}
FileServiceError.prototype = Object.create(Error.prototype);
FileServiceError.prototype.constructor = FileServiceError;

/**
 * Validates the params complies the rules of the specified template and returns
 * the resulting data. If not, it throws a FileServiceError error.
 *
 * @param {Object} template - The template defining the structure of the output data.
 * @param {Object} params - The params you want to validate.
 * @throws {FileServiceError} - Throws the error if params is not valid.
 * @returns {Object} The validated data.
 */
function validateParams(template, params) {
    var result = templo.render(template, params);

    if( result.status !== 'ok' ) {
        throw new FileServiceError({
            status: 422,
            errors: result.errors,
            warnings: result.warnings
        });
    }

    return result.output;
}

/**
 * Validates the data complies the rules of the specified template and returns
 * the resulting data. If not, it throws a FileServiceError error.
 *
 * @param {Object} template - The template defining the structure of the output data.
 * @param {File} data - The data you want to validate.
 * @throws {FileServiceError} - Throws the error if data is not valid.
 * @returns {Object} The validated data.
 */
function parseResponse(template, data) {
    var result = templo.render(template, data.toJSON ? data.toJSON() : data);

    if( result.status !== 'ok' ) {
      throw new FileServiceError({
        status: 500,
        errors: result.errors,
        warnings: result.warnings
      });
    }

    return result.output;
}

// PUBLIC INTERFACE

module.exports = function(db) {
    var File = db.model('File');

    return {
        list: function(params, callback) {
          var fields,
              hidden;

          try {
            params = validateParams(templates.list_params, params);
            fields = params.fields;
            hidden = params.hidden;
            delete params.fields;
            delete params.hidden;
          } catch(e) {
            return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          File.find(params, function(err, files) {
            if( err ) { return callback( new FileServiceError({ status: 500 }), null ); }

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
        },

        content: function(params, callback) {
          var path,
              req;

          try {
            params = validateParams(templates.show_params, params);
          } catch(e) {
            return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          File.findOne(params, function(err, file) {
            if( err ) { return callback( new FileServiceError({ status: 500 }), null ); }
            if( !file ) { return callback( new FileServiceError({ status: 404 }), null); }

            path = [params.project_id, params.path, params.name].join('');
            req = s3.getObject({ Bucket: 'bloks', Key: path });

            return callback(null, {
              req: req,
              stream: req.createReadStream()
            });
          });
        },

        find: function(params, callback) {
          try {
            params = validateParams(templates.show_params, params);
          } catch(e) {
            return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          File.findOne(params, function(err, file) {
            if( err ) { return callback( new FileServiceError({ status: 500 }), null ); }
            if( !file ) { return callback( new FileServiceError({ status: 404 }), null); }

            file = file.toJSON();
            file.full_path = file.path + file.name;

            try {
              return callback( null, parseResponse(templates.show, file) );
            } catch(e) {
              return callback( new FileServiceError({ status: 500, errors: e.errors, warnings: e.warnings }), null);
            }
          });
        },

        create: function(data, callback) {
          var full_path;

          try {
            data = validateParams(templates.create, data);
          } catch(e) {
            return callback(new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          full_path = [data.project_id, data.path, data.name].join('');
          data.size = 0;
          data.mime = data.type === 'file' ? mime.lookup(data.name) || 'text/plain' : 'text/directory';
          data.created_at = Date.now();

          File.create(data, function(err, file) {
            if( err && err.code === MONGO_DUP_KEY ) { return callback( new FileServiceError({ status: 422, message: 'File already exists.', err: 'FILE_ALREADY_EXISTS' }), null); }
            if( err ) { return callback( new FileServiceError({ status: 500 }), null); }

            file = file.toJSON();
            file.full_path = file.path + file.name;

            s3.headObject({
              Bucket: 'bloks',
              Key: file.type === 'dir' ? full_path + '/' : full_path
            }, function(err, res) {
              if( err && err.statusCode !== 404 ) { return callback(new FileServiceError({ status: 500 }), null); }
              if( !err ) { return callback(new FileServiceError({ status: 422, message: 'File already exists.', err: 'FILE_ALREADY_EXISTS' }), null); }

              s3.putObject({
                Bucket: 'bloks',
                Key: full_path + (file.type === 'dir' ? '/' : ''),
                Body: '',
                ACL: 'private',
                ContentType: file.mime
              }, function(err, res) {
                if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

                return callback( null, parseResponse(templates.show, file) );
              });
            });
          });
        },

        create_with_content: function(params, data, callback) {
          var full_path;

          try {
            params = validateParams(templates.create_with_content_params, params);
          } catch(e) {
            return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          full_path = [params.project_id, params.path, params.name].join('');
          params.size = data.length;
          params.mime = params.type === 'file' ? mime.lookup(params.name) || 'text/plain' : 'text/directory';
          params.created_at = Date.now();

          File.create(params, function(err, file) {
            if( err && err.code === MONGO_DUP_KEY ) { return callback( new FileServiceError({ status: 422, message: 'File already exists.', err: 'FILE_ALREADY_EXISTS' }), null); }
            if( err ) { return callback( new FileServiceError({ status: 500 }), null); }

            file = file.toJSON();
            file.full_path = file.path + file.name;

            s3.headObject({
              Bucket: 'bloks',
              Key: file.type === 'dir' ? full_path + '/' : full_path
            }, function(err, res) {
              if( err && err.statusCode !== 404 ) { return callback(new FileServiceError({ status: 500 }), null); }
              if( !err ) { return callback(new FileServiceError({ status: 422, message: 'File already exists.', err: 'FILE_ALREADY_EXISTS' }), null); }

              s3.putObject({
                Bucket: 'bloks',
                Key: full_path + (file.type === 'dir' ? '/' : ''),
                Body: data,
                ACL: 'private',
                ContentType: mime.contentType(file.mime)
              }, function(err, res) {
                if( err ) { console.dir(err); return callback(new FileServiceError({ status: 500 }), null); }

                return callback( null, parseResponse(templates.show, file) );
              });
            });
          });
        },

        update: function(params, data, callback) {
          try {
            params = validateParams(templates.update_params, params);
            data = validateParams(templates.update, data);
          } catch(e) {
            return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          File.findOne(params, function(err, file) {
            if( err ) { return callback( new FileServiceError({ status: 500 }), null); }
            if( !file ) { return callback( new FileServiceError({ status: 404 }), null); }

            data.type = file.type; // Type can't be modified
            data.mime = data.type === 'file' ? mime.lookup(data.name) || 'text/plain' : 'text/directory';

            File.findByIdAndUpdate(file._id, data, function(err, updated_file) {
              if( err ) { return callback( new FileServiceError({ status: 500 }), null); }

              updated_file = updated_file.toJSON();
              updated_file.full_path = updated_file.path + updated_file.name;

              if( updated_file.full_path !== file.path + file.name ) {
                s3.copyObject({
                  Bucket: 'bloks',
                  CopySource: 'bloks/' + file.project_id + file.path + file.name + (file.type === 'dir' ? '/' : ''),
                  Key: updated_file.project_id + updated_file.full_path + (updated_file.type === 'dir' ? '/' : ''),
                  MetadataDirective: 'COPY'
                }, function(err, res) {
                  if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

                  s3.deleteObject({
                    Bucket: 'bloks',
                    Key: file.project_id + file.path + file.name + (file.type === 'dir' ? '/' : '')
                  }, function(err, res) {
                    if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

                    return callback( null, parseResponse(templates.show, updated_file) );
                  });
                });
              } else {
                s3.putObject({
                  Bucket: 'bloks',
                  Key: updated_file.project_id + updated_file.full_path + (updated_file.type === 'dir' ? '/' : ''),
                  ContentType: mime.contentType(data.mime)
                }, function(err, res) {
                  if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

                  return callback( null, parseResponse(templates.show, updated_file) );
                });
              }
            });
          });
        },

        update_content: function(params, data, callback) {
          var full_path;

          try {
            params = validateParams(templates.update_params, params);
          } catch(e) {
            return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          full_path = [params.project_id, params.path, params.name].join('');

          File.findOneAndUpdate(params, { size: data.length || 0 }, function(err, file) {
            if( err ) { return callback( new FileServiceError({ status: 500 }), null); }
            if( !file ) { return callback( new FileServiceError({ status: 422, message: 'File doesn\'t exist.', err: 'FILE_DOES_NOT_EXIST' }), null); }

            file = file.toJSON();
            file.full_path = params.path + params.name;

            s3.headObject({
              Bucket: 'bloks',
              Key: full_path
            }, function(err, res) {
              if( err && err.statusCode === 404 ) { return callback(new FileServiceError({ status: 422, message: 'File doesn\'t exist.', err: 'FILE_DOES_NOT_EXIST' }), null); }
              if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

              s3.putObject({
                Bucket: 'bloks',
                Key: full_path,
                Body: data,
                ACL: 'private',
                ContentType: mime.contentType(mime.lookup(params.name) || 'text/plain')
              }, function(err, res) {
                if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

                return callback( null, parseResponse(templates.show, file) );
              });
            });
          });
        },

        remove: function(params, callback) {
          var full_path;

          try {
            params = validateParams(templates.remove_params, params);
          } catch(e) {
            return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          if( params.name.slice(-1) === '/' ) {
            var query = File.find();

            query.where({ path: new RegExp('^'+params.path+params.name, 'i') });
            query.exec(function(err, files) {
              if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

              s3.listObjects({
                Bucket: 'bloks',
                Prefix: params.project_id+params.path+params.name
              }, function(err, res) {
                if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

                if( res.Contents.length ) {
                  var objects = _.map(res.Contents, function(object) {
                    return {
                      Key: object.Key
                    };
                  });

                  s3.deleteObjects({
                    Bucket: 'bloks',
                    Delete: {
                      Objects: objects
                    }
                  }, function(err, res) {
                    if( err ) { console.dir(err);return callback(new FileServiceError({ status: 500 }), null); }

                    query.remove(function(err) {
                      if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

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

              /*_.each(files, function(f) {
                console.dir(f.toJSON());
              });*/
            });

            return;
          }

          File.findOneAndRemove(params, function(err, file) {
              if( err ) { return callback(new FileServiceError({ status: 500 }), null); }
              if( !file ) { return callback(new FileServiceError({ status: 404, message: 'File not found.', err: 'FILE_NOT_EXISTS' }), null); }

              full_path = [params.project_id, params.path, params.name].join('');

              s3.deleteObject({
                Bucket: 'bloks',
                Key: full_path + (file.type === 'dir' ? '/' : '')
              }, function(err, res) {
                if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

                return callback(null, {
                  status: 200,
                  message: 'File deleted succesfully'
                });
              });
          });
        },

        FileServiceError: FileServiceError
    };
};
