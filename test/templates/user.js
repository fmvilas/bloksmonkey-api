/*global describe,beforeEach,it*/

var jsonTpl = require('jsonTpl'),
	assert = require('assert'),
	user_template = require('../../app/templates/json/user'),
	user_data,
	user_data_with_avatar;

describe('UserTemplate', function() {
	beforeEach(function() {
		user_data = {
			id: 1,
			email: 'fake@email.com',
			name: 'Fake',
			created_at: '2014-10-24T20:39:12Z',
			updated_at: '2014-10-25T21:09:02Z'
		};

		user_data_with_avatar = {
			id: 1,
			email: 'fake@email.com',
			name: 'Fake',
			avatar_url: 'http://www.fakeavatarurl.com/fakeavatar.png',
			created_at: '2014-10-24T20:39:12Z',
			updated_at: '2014-10-25T21:09:02Z'
		};
	});

	describe('#parse', function() {
		it('should return only id, name and avatar_url (as null)', function() {
			var output = jsonTpl.parse(user_template, user_data);

			assert.strictEqual(output.id, 1);
			assert.strictEqual(output.name, 'Fake');
			assert.strictEqual(output.avatar_url, null);
			assert.strictEqual(output.email, undefined);
			assert.strictEqual(output.created_at, undefined);
			assert.strictEqual(output.updated_at, undefined);
		});

		it('should return only id, name and avatar_url (as string)', function() {
			var output = jsonTpl.parse(user_template, user_data_with_avatar);

			assert.strictEqual(output.id, 1);
			assert.strictEqual(output.name, 'Fake');
			assert.strictEqual(output.avatar_url, null);
			assert.strictEqual(output.email, undefined);
			assert.strictEqual(output.created_at, undefined);
			assert.strictEqual(output.updated_at, undefined);
		});
	});
});
