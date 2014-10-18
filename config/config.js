var env = process.env.NODE_ENV || 'development';

var config = {
	env: env,
	
	development: {
		app: {
			name: 'didgeridoo.api'
		},
		port: 3000,
		db: 'mongodb://admin:1234@localhost:27017/didgeridoo'
	},

	test: {
		app: {
			name: 'didgeridoo.api'
		},
		port: 3000,
		db: 'mongodb://localhost/express-test'
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
