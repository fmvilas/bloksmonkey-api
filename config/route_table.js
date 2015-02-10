module.exports = {
	index: '/',
	root: '/api/v1',
	session: {
		login: '/login',
		logout: '/logout'
	},
	oauth2: {
		authorize: '/oauth2/authorize',
		decision: '/oauth2/authorize/decision',
		token: '/oauth2/access_token'
	},
	user: {
		single: '/users/:id',
		collection: '/users'
	},
	project: {
		single: '/projects/:id',
		collection: '/projects'
	}
};
