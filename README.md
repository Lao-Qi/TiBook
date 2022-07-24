# 题书

[![OSCS Status](https://www.oscs1024.com/platform/badge/Lao-Qi/TonYouLu.svg?size=small)](https://www.oscs1024.com/project/Lao-Qi/TonYouLu?ref=badge_small)

### 这是什么？

这是一个简易的，基于 socket.io, vue, vite, electron, element3, node, express, mongodb, redis...的聊天软件
</br>

### 进展

该项目目前还在开发中... 基础功能还不完善，等开发到能用的时候再发布 1.0 版本

### 如何在本地启动这个软件？

```git
git clone https://github.com/Lao-Qi/TiBook.git

cd TiBook
```

```git
# 启动软件
pnpm run dev

# 打包软件
pnpm run build
```
### 项目结构的思路

这个项目的结构有借鉴vscode的开源仓库

``build``是项目的打包区域

``src``是项目源代码区域

``pnpm run build``后会在``build目录``下面生成一个``dist文件夹``，这个文件夹里面的东西就是``打包和压缩好了的源代码``
那些源代码将被``electron-builder``打包进``app.asar``文件中。

- ``app-main``：electron主进程中运行的资源
- ``app-render``：electron渲染进程运行的资源

``app-render``通过``vite``打包和压缩。

``app-main``通过``esbuild``打包和压缩，因为``esbuild``有把``app-main``中所需要的扩展打包进``main.js``文件中(除了``electron``模块)，所以打包后的资源中``不存在node_module``文件夹

项目中采用多个``package.json``文件是为了合理的使用``node_module``中的包，有些包只在``build目录``中使用，而有些包是``src目录``中使用，这里要区分开，方便管理，也方便查看。
项目``根目录的package.json``是俩边在``开发环境``会用到的包，可以看到内部只有``devDependencies``没有``dependencies``

``app.deploy.json``文件会该项目信息的集合，因为有多个``package.json``不太好区分具体的信息，所以创建了这个文件。

这个文件的内部信息会被在软件打包后在``dist``目录转换成一个``package.json``，应用于``electron应用程序``的打包

### 计划
- 修改为单窗口应用
- 添加多线程处理

## 开源协议

### MIT
