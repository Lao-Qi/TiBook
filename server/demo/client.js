// const readline = require("node:readline");
// const io = require("socket.io-client");
// const { LoginUser, GetPublicKey } = require("../../electron/tool/ServerRequire");
//
//
//
// async function main() {
// 	const rl = readline.createInterface({
// 		input: process.stdin,
// 		output: process.stdout
// 	})
// 	const publicKey = await GetPublicKey();
// 	const [account, pwd] = await ReadlineLogin(rl, 1, []);
// 	// 登录
// 	const LoginData = await LoginUser(account, pwd, publicKey);
// 	if(LoginData.token) {
// 		let room, messageList = {};
// 		console.log("登录成功");
// 		// 自己的聊天记录
// 		messageList[account] = [];
// 		room = account;
// 		// 会话用的套接字(socket)
// 		const socket = io.connect("http://127.0.0.1:6001", {
// 			auth: {
// 				// 登录后发送过来的token
// 				token: LoginData.token
// 			},
// 			autoConnect: false
// 		});
//
// 		socket.timeout(4000).connect();
//
// 		// 连接后后端返回的提示语
// 		socket.on("connect msg", (msg) => {
// 			console.log(msg);
// 		})
//
// 		// 有用户加入房间，本地新增一位用户
// 		socket.on("user join", user => {
// 			// 在本地聊天记录缓存中加入新的用户消息列表
// 			messageList[user.account] = [];
// 			console.log(`${user.name} 加入房间`);
// 		})
//
// 		// 自己发的消息
// 		socket.on("own message", msg => {
// 			if(msg.from === account) {
// 				console.log(`[${(new Date(msg.date)).toLocaleTimeString("zh-CN")}] ${msg.name}: ${msg.content}`);
// 			}
// 		})
//
// 		// 当前所处的房间有消息发给过来
// 		socket.on("message", msg => {
// 			// 判断当前是否在消息对应的用户房间中
// 			if(room === msg.from) {
// 				console.log(`[${(new Date(msg.date)).toLocaleTimeString("zh-CN")}]  ${msg.name}: ${msg.content}`);
// 			}else {
// 				// 将消息存储到对应的用户消息列表里面
// 				messageList[msg.from].push(msg);
// 				console.log(`账号 ${msg.from} 有新的消息, 当前所处房间为 ${room}, 查看指令: join ${msg.from}`);
// 			}
// 		})
//
// 		// 加入别人的房间成功触发，附带一个别人的账号
// 		socket.on("join user message", ({code, account = "", msg = ""}) => {
// 			if(code === 200) {
// 				room = account;
// 				// 加入用户成功, 如果缓存中有对应用户的消息，则渲染出来
// 				messageList[account]?.forEach(msg => {
// 					console.log(`[${(new Date(msg.date)).toLocaleTimeString("zh-CN")}]  ${msg.name}: ${msg.content}`);
// 				})
// 				console.log(`加入 ${account} 用户房间成功`);
// 			}else {
// 				console.log(`加入错误: ${code}  ${msg}`);
// 			}
// 		})
//
// 		// 异常事件
// 		socket.on("connect_error", () => {
// 			console.log("服务器连接失败");
// 		})
//
// 		socket.on("disconnect", () => {
// 			console.log("与服务器断开连接");
// 		})
//
// 		// 连接成功后触发
// 		socket.on("connect",  async () => {
// 			// 让控制台时刻可以输入
// 			while (1) {
// 				// 客户端是否有连接到服务器
// 				if(socket.connected) {
// 					const text = await ReadLineSay(rl);
// 					if(text === "exit") {
// 						// 与服务器断开连接
// 						socket.close();
// 						break;
// 					}else if(/^join [\d]*$/.test(text)) {
// 						const linkAccount = text.match(/[0-9]+/g)[0];
// 						socket.emit("join", linkAccount);
// 					}else {
// 						socket.emit("publish msg", text);
// 					}
// 				}else {
// 					console.log("连接已断开");
// 					break;
// 				}
// 			}
// 		})
// 	}else {
// 		console.log("登录失败: " + JSON.stringify(LoginData))
// 	}
// }
//
// // 用户登录的终端流程
// async function ReadlineLogin(rl, stage, infoArr) {
// 	if(stage === 1) {
// 		infoArr.push(await question(rl, "输入账号: "));
// 		console.log(infoArr);
// 		return ReadlineLogin(rl, ++stage, infoArr);
// 	}else if(stage === 2) {
// 		infoArr.push(await question(rl, "输入密码: "));
// 		console.log(infoArr);
// 		return infoArr;
// 	}
// }
//
// // 用户输入
// function ReadLineSay(rl) {
// 	return new Promise(res => {
// 		rl.question("", (data) => {
// 			res(data)
// 		})
// 	})
// }
//
// // 让控制台与用户对话
// function question(rl, text) {
// 	return new Promise(res => {
// 		rl.question(text, (data) => {
// 			res(data);
// 		})
// 	})
// }
//
// main();