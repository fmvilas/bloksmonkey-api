var templo = require('templo'),
    templates = require('../templates/json/project'),
    _ = require('underscore');

/**
 * Custom Error for the service. It allows a status and details about warnings
 * and errors you want to communicate.
 *
 * @param {Object} [options] - A hash of options, i.e. status, message, warnings, etc.
 */
function ProjectServiceError(options) {
    options = options || {};
    this.status = options.status || 500;
    this.name = 'ProjectServiceError';

    if( options.message ) {
        this.message = options.message;
    } else {
        switch(this.status) {
            case 404:
                this.message = 'Project not found';
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

    if( options.warnings ) { this.warnings = options.warnings; }
    if( options.errors ) { this.errors = options.errors; }
}
ProjectServiceError.prototype = Object.create(Error.prototype);
ProjectServiceError.prototype.constructor = ProjectServiceError;

/**
 * Validates the params complies the rules of the specified template and returns
 * the resulting data. If not, it throws a ProjectServiceError error.
 *
 * @param {Object} template - The template defining the structure of the output data.
 * @param {Object} params - The params you want to validate.
 * @throws {ProjectServiceError} - Throws the error if params is not valid.
 * @returns {Object} The validated data.
 */
function validateParams(template, params) {
    var result = templo.render(template, params);

    if( result.status !== 'ok' ) {
        throw new ProjectServiceError({
            status: 422,
            errors: result.errors,
            warnings: result.warnings
        });
    }

    return result.output;
}

/**
 * Validates the data complies the rules of the specified template and returns
 * the resulting data. If not, it throws a ProjectServiceError error.
 *
 * @param {Object} template - The template defining the structure of the output data.
 * @param {Project} data - The data you want to validate.
 * @throws {ProjectServiceError} - Throws the error if data is not valid.
 * @returns {Object} The validated data.
 */
function parseResponse(template, data) {
    var result = templo.render(template, data.toJSON ? data.toJSON() : data);

    if( result.status !== 'ok' ) {
        throw new ProjectServiceError({
            status: 500,
            errors: result.errors,
            warnings: result.warnings
        });
    }

    return result.output;
}

// PUBLIC INTERFACE

module.exports = function(db) {
    var ProjectSchema = require('../models/project'),
        Project = db.model('Project');

    return {
        list: function(params, callback) {
            var query;

            params = validateParams(templates.list_params, params);

            query = Project.find();

            if( params.user_id ) {
                switch(params.user_role) {
                    case 'member':
                        query = query.where('members').in([params.user_id]);
                        break;
                    case 'owner':
                        query = query.where('owner_id').equals(params.user_id);
                        break;
                    default:
                        query = query.or([
                            { members: { $in: [params.user_id] } },
                            { owner_id: params.user_id }
                        ]);
                }
            }

            if( params.visibility ) {
                query = query.where('visibility').equals(params.visibility);
            }

            query.exec(function(err, projects) {
                if( err ) { throw new ProjectServiceError({ status: 500 }); }

                var output = [];
                _.each(projects, function(project) {
                    output.push(parseResponse(templates.show, project));
                });

                callback(output);
            });
        },

        find: function(params, callback) {
            params = validateParams(templates.show_params, params);

            Project.findOne(params, function(err, project) {
                if( err ) { throw new ProjectServiceError({ status: 500 }); }
                if( !project ) { throw new ProjectServiceError({ status: 404 }); }

                callback( parseResponse(templates.show, project) );
            });
        },

        update: function(params, data, callback) {
            params = validateParams(templates.update_params, params);
            data = validateParams(templates.update, data);

            Project.findOneAndUpdate(params, data, function(err, project) {
                if( err ) { throw new ProjectServiceError({ status: 500 }); }
                if( !project ) { throw new ProjectServiceError({ status: 404 }); }

                callback( parseResponse(templates.show, project) );
            });
        },

        create: function(data, callback) {
            data = validateParams(templates.create, data);

            Project.create(data, function(err, project) {
                if( err ) { throw new ProjectServiceError({ status: 500 }); }

                callback( parseResponse(templates.show, project) );
            });
        },

        remove: function(params, callback) {
            params = validateParams(templates.remove_params, params);

            Project.findByIdAndRemove(params._id, function(err) {
                if( err ) { throw new ProjectServiceError({ status: 500 }); }

                callback( parseResponse(templates.remove_response, {
                    status: 200,
                    message: 'Project deleted succesfully'
                }) );
            });
        },

        ProjectServiceError: ProjectServiceError
    };
};
