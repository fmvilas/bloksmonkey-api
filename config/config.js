var env = process.env.NODE_ENV || 'development';

var config = {
	env: env,

	development: {
		app: {
			name: 'didgeridoo.api'
		},
		port: 3000,
		db_uri: 'mongodb://localhost/didgeridoo',
		db_options: {
			user: 'didgeridooUser',
			pass: '1234',
			port: 27017
		}
	},

	test: {
		app: {
			name: 'didgeridoo.api'
		},
		port: 3000,
		db_uri: 'mongodb://localhost/didgeridoo_test',
		db_options: {
			user: 'didgeridooUser',
			pass: '1234',
			port: 27017
		}
	},

	production: {
		app: {
			name: 'didgeridoo.api'
		},
		port: 3000,
		db: 'mongodb://localhost/express-production'
	}
};

module.exports = config[env];
