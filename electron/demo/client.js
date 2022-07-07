const io = require("socket.io-client")
const { LoginUser } = require("../tools/ServerRequire")

async function main() {
    const LoginData = await LoginUser("12301276817", "12301276817")
    const socket = io.connect("http://127.0.0.1:6001", {
        auth: {
            token: LoginData.token,
        },
        timeout: 4000,
    })
    socket.on("connect", () => {
        console.log("连接成功")
        // socket.emit("join room", "2231675321")
        // socket.emit("send message", "在吗")
    })

    // socket.on("message", (msg) => {
    //     console.log(msg)
    // })
}

main().then()
