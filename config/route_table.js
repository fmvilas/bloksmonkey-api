module.exports = {
	index: '/',
	user: {
		login: '/login',
		logout: '/logout',
		item: '/users/:id'
	},
	oauth2: {
		authorize: '/login/oauth2/authorize',
		decision: '/login/oauth2/authorize/decision',
		token: '/login/oauth2/access_token'
	}
};
