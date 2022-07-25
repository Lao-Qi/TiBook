/**
 * 用来测试服务的文件
 *
 * 这个是服务器通信服务
 */
const io = require("socket.io-client")

const socket = io.connect("http://127.0.0.1:6001", {
    auth: {
        /**
         * 测试用的用户token
         */
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjAzMDA5MDM5OTIsImRhdGEiOiJFWW5yQ0VmWEhNVU4xKzJFMjMyZXdDVUc2WkJmVGttMnVPRVoxQ1A2dlFPOTFHS080aDhJazkzZWxMdGtTb0xEZkxVOVNvQW80YnZRbUZmdXJJSno2WVl0aEwzcFZQbFd1a0NCMFdySVJ1d1RDV0g0b0RBNWZVMjRyTFRGUHV3MkRGcUJRWHpPbmhQZkhldFduSk0zM1Q0RWN2MDBZT2lhWUpKdlR0a2JXaGUxTzhaVDlvMDFnQ2sveVhXVW9qbXNRV1cvNDJ2NUpTdFVVK3pPVzBKeVI4cWEwNWNhM3dTUEdYTlkyT1RGMmtHK0dUUks3VHZLUFViSFl0Nk5xQXB6Sm50b3ZWRDdOWFJ5SlJYdU1Na2JTUDFhZ3djeFRIV25VY2VaTWNmVjIyR2VWWGs2ZWVjcitYRHVRaU5hRWhYWmdnOXROZE1nNDdOa0NVWkh4Rmk0L3c9PSIsImlhdCI6MTY1NzcwODkwM30.ksNK4lvm9LDNxYNliUQFL-yGMlJpcyk1-EnimWgCK6w"
    },
    timeout: 4000
})

socket.on("connect", () => {
    console.log("服务器连接成功")
})
