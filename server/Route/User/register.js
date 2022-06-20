'use strict';
const bcrypt = require("bcryptjs");
const RSA_JWT = require("../../lib/keys.js");
const { Users } = require("../../model/model");
const router = require("express").Router();

router.post("/register", async (req, res) => {
	const body = req.body;
	console.log(body)
	if(body.name && body.ping && body.account) {
		if(await FindAccount(body.account)) {
			// 验证用户名是否合法
			if(verification(body.name, 1, 10) && verification(body.account, 6, 24)) {
				// 用私钥解除用户密码
				const PingCode = RSA_JWT.Decrypt(body.ping);
				const doc = new Users({
					name: body.name,
					ping: bcrypt.hashSync(PingCode),
					account: body.account,
					ip: req.ip,
					System: body.type || req.headers["user-agent"]
				})
				doc.save();
				res.send({
					code: 200,
					body,
					id: doc._id,
					msg: "注册成功"
				})
			}else {
				res.send({
					code: 400,
					body,
					msg: "名称或账号不合法"
				})
			}
		}else {
			res.send({
				code: 400,
				body,
				msg: "账号已存在"
			})
		}
	} else {
		res.send({
			code: 400,
			body,
			msg: "数据缺失"
		})
	}
})

module.exports = router;

// 查询用户名和账号是否合法
function verification(data, minNumber, maxNumber) {
	const xss_reg = new RegExp("[<>\\/]/", "g");
	const string_reg = new RegExp(`[a-zA-Z0-9_.*&^%$#@!?)("':;}{\[\]\+=-_~\`|\u4e00-\u9fa5]{${minNumber},${maxNumber}`)
	return !(xss_reg.test(data) || string_reg.test(data));
}

// 查询账号是否存在
function FindAccount(account) {
	return new Promise(res => {
		Users.findOne({ account }, (err, doc) => {
			res(!doc)
		})
	})
}

