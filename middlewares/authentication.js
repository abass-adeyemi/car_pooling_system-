require('dotenv').config();
const jwt = require('jsonwebtoken');
const msgClass = require('../errors/errors');

const authentication = async (req, res, next) => {
	const { token } = req.headers;
	console.log('token=>', token);
	if (!token) {
		res.status(401).send({
			status: false,
			message: 'Invalid Access',
		});
	} else {
		const tokenSplit = token.split(' ');
		jwt.verify(tokenSplit[1], process.env.JWT_SECRET, (err, decoded) => {
			console.log('splitToken=>', tokenSplit[1]);

			if (err) {
				res.status(401).send({
					status: false,
					message: 'unauthorized Access',
				});
			}
			console.log('decoded=>', decoded);
			req.body.email = decoded.email;
			req.body.fakeID = decoded._id;

			next();
		});
	}
};
// module.exports = { authentication };
module.exports = {
	authentication,
};
