const express = require('express');
const crypto = require('crypto');


class KeksikVKCallbackApi {
	constructor(token, code, port = 3000) {
		this.token = token;
		this.code = code;
		this.port = port;
	}


	#events = [];


	listen() {
		const app = express();

		app.use(express.json());

		app.post('/', (req, res) => {
			let result = {
				status: 'error',
			};
			let data = req.body;

			if (!this.#checkHash(data)) {
				res.status(400);
				res.send(result);

				return;
			}

			switch (data?.type) {
				case 'confirmation':
					result.status = 'ok';
					result.code = this.code;

					break;

				case 'new_donate':
					this.#triggerEvent('new_donate', data.donate, data.group);
					result.status = 'ok';

					break;

				case 'payment_status':
					this.#triggerEvent('payment_status', data.payment, data.group);
					result.status = 'ok';

					break;
			}


			res.send(result);
		});

		app.listen(this.port, () => {
			console.log(`Keksik Callback server started on port ${this.port}`);
		});
	}


	#getHashArray(params, indx = '') {
		let arr = [];

		if (indx) {
			indx += '/';
		}

		for (let key in params) {
			let val = params[key];

			if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
				arr = {
					...this.#getHashArray(val, indx + key),
					...arr,
				}
			} else {
				arr[indx + key] = val;
			}
		}

		return arr;
	}

	#checkHash(data) {
		let hash = data.hash;
		delete data.hash;

		let obj = this.#getHashArray(data);
		let arr = [];
		let str = '';

		for (let key in obj) {
			arr.push([key, obj[key]]);
		}

		arr.sort();

		for (let item of arr) {
			str += (typeof item[1] === 'boolean' ? (item[1] ? '1' : '') : item[1]) + ',';
		}


		let result = crypto
			.createHash('sha256')
			.update(str + this.token)
			.digest('hex');


		return result === hash;
	}

	#triggerEvent(method, data, group) {
		for (let event of this.#events) {
			if (event.method === method) {
				event.callback(data, group);
			}
		}
	}


	newDonate(callback) {
		this.#events.push({
			method: 'new_donate',
			callback: callback,
		});
	}

	paymentStatus(callback) {
		this.#events.push({
			method: 'payment_status',
			callback: callback,
		});
	}
}


module.exports = KeksikVKCallbackApi;
