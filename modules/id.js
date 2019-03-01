const uuid = require('node-uuid');

module.exports = function new_id() {
	return (uuid.v4());
};
