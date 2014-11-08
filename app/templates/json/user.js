var user_show = {
	id: 		{ type: 'string' },
	email: 		{ type: 'string' },
	name: 		{ type: 'string' },
	avatar_url: { type: 'string', default: null },
	created_at: { type: 'string' },
	updated_at: { type: 'string' }
};


var user_create = {
	email: 		{ type: 'string' },
	password: 	{ type: 'string' },
	name: 		{ type: 'string' },
	avatar_url: { type: 'string', default: null },
	created_at: { type: 'string', default: 'timestamp' },
	updated_at: { type: 'string', default: 'timestamp' }
};

module.exports = {
	show: user_show,
	create: user_create
};
