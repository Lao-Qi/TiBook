'use strict';
const path = require("path");
const Nedb = require("nedb");
const { app } = require("electron");
const { SearchUser } = require("./ServerRequire");

// 本地软件存储
const DB = {
	message: new Nedb({
		filename: path.join(app.getAppPath(), "./message.db"), // 文件路径
		autoload: true, // 自动连接
		corruptAlertThreshold: 1 // 数据缺失多少报错， 1表示不报错
	}),
	friends: new Nedb({
		filename: path.join(app.getAppPath(), "./friendList.db"),
		autoload: true,
		corruptAlertThreshold: 1
	}),
	messageCards: new Nedb({
		filename: path.join(app.getAppPath(), "./messageCards.db"),
		autoload: true,
		corruptAlertThreshold: 1
	})
};


// 添加消息
function insertMessage(msg, isRead) {
	DB.message.insert({ ...msg, isRead })
}

// 查找对应转换的消息记录
function findHistoryAccountMessage(account) {
	return new Promise(res => {
		// 查询我发给他的 或 他发给我的
		DB.message.find({
			$or: [{from: account}, {to: account}]
		},(err, docs) => {
			if(docs.length) {
				// 按时间进行排序
				docs.sort((a, b) => a.date - b.date);
				res(docs);
			}else {
				res([]);
			}
		})
	})
}



// 更新消息卡片
function updateMessageCard(insertMessageCardAccount, { content, date }) {
	return new Promise((res, rej) => {
		// 更新该好友消息卡片的消息记录
		DB.messageCards.update({
			// 如果这条消息是我发送出去的，则修改接收方在本地的消息卡片
			account: insertMessageCardAccount
		}, {
			$set: {
				msg: {
					content,
					date
				}
			}
		}, {
			multi: false,
			returnUpdatedDocs: true
		},(err, ret, newDoc) => {
			// 查询得到并且修改成功
			ret === 1  ? res(newDoc) : rej({content, date});
		})
	})
}

// 添加消息卡片
function insertMessageCard(insertMessageCardAccount, {content, date}) {
	return new Promise(res => {
		// 先查询本地好友列表查看有没有该条消息的来源用户
		DB.friends.findOne({
			account: insertMessageCardAccount
		}, async (err, doc) => {
			// 查询不到用户
			if(!doc) {
				// 本地查询不到则到服务器查询
				const SearchUserDate = (await SearchUser(insertMessageCardAccount)).user;
				doc = {
					name: SearchUserDate.name,
					account: SearchUserDate.account,
					avatar: SearchUserDate.avatar
				}
			}
			// 添加消息卡片
			DB.messageCards.insert({
				...doc,
				msg: {
					content,
					date
				}
			}, (err, doc) => {
				res(err ? {} : doc);
			})
		})
	})
}

// 获取本地所有的消息卡片
function getLocalMessageCard() {
	return new Promise(res => {
		DB.messageCards.find({}, (err, docs) => {
			res(docs);
		})
	})
}





// 查询本地好友列表
function findLocalFriends() {
	return new Promise((res, rej) => {
		DB.friends.find({}, (err, docs) => {
			err ? rej(err) : res(docs);
		})
	})
}

// 添加好友
function insertFriend(friend) {
	DB.friends.insert(friend)
}

module.exports = {
	insertMessage,
	findHistoryAccountMessage,
	getLocalMessageCard,
	insertMessageCard,
	updateMessageCard,
	findLocalFriends,
	insertFriend
}