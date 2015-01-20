var user_show = {
	id: 		{ type: 'string' },
	email: 		{ type: 'string' },
	name: 		{ type: 'string' },
	avatar_url: { type: 'string' },
	created_at: { type: 'string' },
	updated_at: { type: 'string' }
};


var user_create = {
	email: 		{ type: 'string', required: true },
	password: 	{ type: 'string', required: true },
	name: 		{ type: 'string', required: true },
	avatar_url: { type: 'string', default: null },
	created_at: { type: 'string', read_only: true, default: 'timestamp' },
	updated_at: { type: 'string', read_only: true, default: 'timestamp' }
};

module.exports = {
	show: user_show,
	create: user_create
};
