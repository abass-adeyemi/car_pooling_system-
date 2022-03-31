const riderSQL = require('../configuration/mysql');
const createPayment = async (
	email,
	customer_id,
	amount,
	payment_Reference,
	payment_channel
) => {
	return new Promise(
		(resolve, reject) => {
			riderSQL.query({
				sql: `Insert into _payment_transaction (email, customer_id, amount, payment_Reference, payment_channel)values(?,?,?,?,?)`,
				values: [
					email,
					customer_id,
					amount,
					payment_Reference,
					payment_channel,
				],
			});
		},
		(err, results, fields) => {
			if (err) {
				reject(err);
			}
			resolve(results);
		}
	);
};
module.exports = { createPayment };
