module.exports = {
	index: '/',
	root: '/api/v1',
	session: {
		login: '/login',
		logout: '/logout'
	},
	oauth2: {
		authorize: '/login/oauth2/authorize',
		decision: '/login/oauth2/authorize/decision',
		token: '/login/oauth2/access_token'
	},
	user: {
		single: '/users/:id',
		collection: '/users'
	}
};
