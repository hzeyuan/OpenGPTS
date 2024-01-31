### 技术栈

#### 本项目使用以下技术栈

* [tailwindcss](https://tailwindcss.com/docs)
* [nextjs](https://nextjs.org/docs/getting-started)
* pnpm
* typescript
* [react](https://reactjs.org/docs/getting-started.html)
* [plasmo](https://docs.plasmo.com/)
* [ant-design](https://ant.design/docs/react/introduce-cn)

### 项目架构

项目是mono repo，使用pnpm管理，目录结构如下：

```
├── README.md
├── README_EN.md
├── SETUP.md
├── apps
├── changeLog.md
├── images
├── node_modules
├── package.json
├── packages
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── turbo.json
```

#### apps目录
* apps/website: 项目的网站，包括主页、文档、博客等
* apps/extensions: 项目的浏览器插件，包括Chrome、Firefox等

#### packages目录
存放项目的公共模块，例如：

* packages/@opengpts  项目的核心包，包括对话管理、对话消息发送、对话状态查询等
* packages/typescript-config 项目的ts配置
* packages/tailwind-config 项目的tailwind配置
* packages/eslint 项目的eslint配置
* packages/types 项目的公共类型定义
其他共享模块

## 应用

- apps/website: 项目的网站，包括主页，文档，博客等
- apps/extensions: 项目的浏览器插件，包括chrome，firefox等



### 插件开发

插件是基于[plasmo]框架(https://docs.plasmo.com/)开发，如果需要了解插件的开发流程，可以参考[plasmo文档](https://docs.plasmo.com/)。插件的开发流程如下：

1. 在根目录下执行命令，安装依赖

```bash
pnpm i
```

2. 启动插件

```bash
pnpm run dev:ext
```

会在app/extensions/build目录下生成插件的文件，然后在chrome浏览器中加载插件即可。

### 网站开发

1. 启动网站

```bash
pnpm run dev:web
```

标准的nextjs应用，需要了解nextjs的开发流程, 可以参考[Next.js Documentation](https://nextjs.org/docs/getting-started)
