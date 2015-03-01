var FileSchema = require('../../models/file'),
    templo = require('templo'),
    templates = require('./templates/file'),
    _ = require('underscore'),
    AWS = require('aws-sdk'),
    util = require('util'),
    async = require('async'),
    mime = require('mime-types');

var MONGO_DUP_KEY = 11000;

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

        stats: function(params, callback) {
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

              return callback( null, parseResponse(templates.show_stats, file) );
          });
        },

        raw: function(params, callback) {
          var s3,
              path;

          AWS.config.loadFromPath('./config/aws.js');
          s3 = new AWS.S3();

          try {
            params = validateParams(templates.show_params, params);
          } catch(e) {
            return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          path = [params.project_id, params.path, params.name].join('');

          s3.getObject({ Bucket: 'bloks', Key: path }, function(err, res) {
            if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

            return callback(null, res.Body);
          });
        },

        find: function(params, callback) {
          var self = this;

          try {
            params = validateParams(templates.show_params, params);
          } catch(e) {
            return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          async.parallel([
            function(cb) { self.stats(params, cb); },
            function(cb) { self.raw(params, cb); }
          ], function(err, results) {
            if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

            var file = results[0];
            file.encoding = 'base64';
            file.content = results[1].toString('base64');
            return callback(null, file);
          });
        },

        create: function(data, callback) {
          var full_path,
              s3;

          try {
            data = validateParams(templates.create, data);
          } catch(e) {
            return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          full_path = [data.project_id, data.path, data.name].join('');
          data.size = data.content.length;
          data.mime = data.type === 'file' ? mime.lookup(data.name) || 'text/plain' : 'text/directory';
          data.created_at = Date.now();

          File.create(data, function(err, file) {
            if( err && err.code === MONGO_DUP_KEY ) { return callback( new FileServiceError({ status: 422, message: 'File already exists.', err: 'FILE_ALREADY_EXISTS' }), null); }
            if( err ) { return callback( new FileServiceError({ status: 500 }), null); }

            file = file.toJSON();
            file.full_path = file.path + file.name;

            AWS.config.loadFromPath('./config/aws.js');
            s3 = new AWS.S3();

            s3.headObject({
              Bucket: 'bloks',
              Key: file.type === 'dir' ? full_path + '/' : full_path
            }, function(err, res) {
              if( err && err.statusCode !== 404 ) { return callback(new FileServiceError({ status: 500 }), null); }
              if( !err ) { return callback(new FileServiceError({ status: 422, message: 'File already exists.', err: 'FILE_ALREADY_EXISTS' }), null); }

              s3.putObject({
                Bucket: 'bloks',
                Key: full_path + (file.type === 'dir' ? '/' : ''),
                Body: data.content,
                ACL: 'private',
                ContentType: file.mime
              }, function(err, res) {
                if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

                return callback( null, parseResponse(templates.show_all, file) );
              });
            });
          });
        },

        update: function(data, callback) {
            var params,
                body,
                s3;

            try {
              params = validateParams(templates.update_params, data);
            } catch(e) {
              return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
            }

            File.findOne(params, function(err, file) {
              if( err ) { return callback( new FileServiceError({ status: 500 }), null); }
              if( !file ) { return callback( new FileServiceError({ status: 404 }), null); }

              data.type = file.type; // Type can't be modified
              data.mime = data.type === 'file' ? mime.lookup(data.name) || 'text/plain' : 'text/directory';

              try {
                body = validateParams(templates.update, data);
              } catch(e) {
                return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
              }

              if( typeof body.content === 'string' ) {
                body.size = body.content.length;
              }

              File.findByIdAndUpdate(file._id, body, function(err, updated_file) {
                if( err ) { return callback( new FileServiceError({ status: 500 }), null); }

                updated_file = updated_file.toJSON();
                updated_file.full_path = updated_file.path + updated_file.name;

                AWS.config.loadFromPath('./config/aws.js');
                s3 = new AWS.S3();

                s3.putObject({
                  Bucket: 'bloks',
                  Key: updated_file.project_id + updated_file.full_path + (updated_file.type === 'dir' ? '/' : ''),
                  Body: body.content,
                  ContentType: file.mime
                }, function(err, res) {
                  if( err ) { return callback(new FileServiceError({ status: 500 }), null); }

                  return callback( null, parseResponse(templates.show_all, updated_file) );
                });
              });
            });
        },

        remove: function(params, callback) {
          try {
            params = validateParams(templates.remove_params, params);
          } catch(e) {
            return callback( new FileServiceError({ status: 422, errors: e.errors, warnings: e.warnings }), null);
          }

          File.findOneAndRemove(params, function(err, file) {
              if( err ) { return callback(new FileServiceError({ status: 500 }), null); }
              if( !file ) { return callback(new FileServiceError({ status: 404, message: 'File not found.', err: 'FILE_NOT_EXISTS' }), null); }

              AWS.config.loadFromPath('./config/aws.js');
              var s3 = new AWS.S3(),
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
