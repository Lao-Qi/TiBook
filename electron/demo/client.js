const io = require("socket.io-client");
const { GetPublicKey, LoginUser} = require("../tool/ServerRequire");

async function main() {
	const publicKey = await GetPublicKey();
	const LoginData = await LoginUser("12301276817", "12301276817", publicKey);
	const socket = io.connect("http://127.0.0.1:6001", {
		auth: {
			token: LoginData.token,
		},
		timeout: 4000
	})
	socket.on("connect", () => {
		socket.emit("join room", "2231675321");
		socket.emit("send message", "在吗");
	})

	socket.on("message", msg => {
		console.log(msg);
	})
}

main().then();