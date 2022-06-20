'use strict';
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { publicEncrypt, privateDecrypt } = require("crypto");

const passphrase = fs.readFileSync(path.join(__dirname, "../keys/passphrase.txt"), "utf8");
const publicKey = fs.readFileSync(path.join(__dirname, "../keys/publicKey.key"), "utf8");
const privateKey = fs.readFileSync(path.join(__dirname, "../keys/privateKey.key"), "utf8");

class RSA_JWT {
	static publicKey = publicKey;
	static privateKey = privateKey;
	static passphrase = passphrase;

	// RSA加密
	static Encrypt(data) {
		return publicEncrypt(
			publicKey,
			Buffer.from(typeof data === "string" ? data : JSON.stringify(data))
		).toString("base64");
	}

	// RSA解密
	static Decrypt(encryptData) {
		return privateDecrypt({
			key: privateKey,
			passphrase: passphrase
		}, Buffer.from(encryptData, "base64")).toString()
	}

	// 将原始数据通过RSA加密再添加到token里面
	static EncryptJWT(data) {
		const encryptData = this.Encrypt(data);
		return jwt.sign({
			// 默认一天
			exp: data.outTime || Math.floor(Date.now() + (1000 * 60 * 60 * 24)),
			data: encryptData
		}, this.passphrase);
	}

	// 从token解密出原始数据
	static DecryptJWT(token) {
		try {
			const verifyData = jwt.verify(token, passphrase);
			return JSON.parse(this.Decrypt(verifyData.data));
		} catch (err) {
			console.error(err);
			return false;
		}
	}

	// 验证一个token是否已经过期
	static VerifyTimeIsOut(token) {
		return token ? jwt.verify(token, passphrase).exp > Date.now() : false;
	}
}

module.exports = RSA_JWT;


