const authorization = (req, res, next) => {
	const { email } = req.body;
	console.log('email authorization', email);
	next();
};

module.exports = {
	authorization,
};
