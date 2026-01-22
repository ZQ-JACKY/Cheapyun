# 廉价云自动签到脚本

## 项目简介

这是一个用于自动签到 [廉价云](https://cheapyun.com) 网站的脚本，使用 Puppeteer 实现自动化操作。脚本会自动登录账户、跳转到签到页面并执行签到操作，适用于 GitHub Actions 定时执行。

## 功能特性

- ✅ 自动登录账户
- ✅ 自动跳转到签到页面
- ✅ 自动点击签到按钮
- ✅ 支持多次尝试和错误处理
- ✅ 保存操作截图用于调试
- ✅ 兼容 GitHub Actions 环境


## 部署步骤

1. 首先fork此项目
2. 接着在 GitHub 仓库的 `Settings` → `Secrets and variables` → `Actions` 中添加以下 secrets：
   - `USERNAME`: 廉价云账号
   - `PASSWORD`: 廉价云密码
   - `TELEGRAM_BOT_TOKEN`: Telegram 机器人 Token（可选，用于接收通知）
   - `TELEGRAM_CHAT_ID`: Telegram 聊天 ID（可选，用于接收通知）
3. 最后点击`Actions`,运行工作流`自动签到`

### Telegram 通知配置

#### 1. 创建 Telegram 机器人

1. 在 Telegram 中搜索并开始对话 `@BotFather`
2. 发送 `/newbot` 命令创建新机器人
3. 按照提示输入机器人名称（如 `CheapYunSigninBot`）
4. 输入机器人用户名（必须以 `bot` 结尾，如 `CheapYunSigninBot`）
5. BotFather 会生成一个 Token，复制这个 Token（格式：`123456789:ABCdefGhIjKlMnOpQrStUvWxYz`）

#### 2. 获取 Chat ID

1. 在 Telegram 中搜索并开始对话 `@userinfobot`
2. 发送任意消息，机器人会回复您的 Chat ID
3. 复制这个 Chat ID（格式：`123456789`）


#### 3. 配置环境变量

将获取到的 `YOUR_BOT_TOKEN` 和 `YOUR_CHAT_ID` 设置GitHub Secrets：
- `TELEGRAM_BOT_TOKEN`: 您的机器人 Token
- `TELEGRAM_CHAT_ID`: 您的 Chat ID
## 故障排除

### 常见问题

1. **签到按钮点击失败**
   - 可能原因：XPath 路径变更、页面加载不完全
   - 解决方法：脚本会自动尝试多次查找和点击，同时会尝试通过文字内容查找签到按钮

2. **跳转失败**
   - 可能原因：网络延迟、登录状态异常
   - 解决方法：脚本会自动尝试多次跳转，并使用备用方案

3. **环境变量未设置**
   - 错误信息：`错误：未设置账号密码环境变量`
   - 解决方法：确保正确设置了 `USERNAME` 和 `PASSWORD` 环境变量

### 调试方法

1. **查看截图**：脚本会在 `screenshots` 目录下保存操作截图，可用于分析失败原因
2. **查看日志**：脚本会输出详细的执行日志，可根据日志定位问题
3. **本地运行**：在本地运行脚本，观察详细的执行过程



## 注意事项

1. **账号安全**：请妥善保管您的账号密码和 Telegram 机器人 Token，不要在代码中硬编码
2. **使用频率**：建议合理设置签到频率，避免过于频繁的操作
3. **网站变更**：如果廉价云网站结构发生变更，可能需要更新脚本中的 XPath 路径
4. **GitHub Actions 限制**：免费版 GitHub Actions 有执行时间限制，请合理配置
5. **Telegram 限制**：Telegram 对机器人发送消息有一定限制，请不要过于频繁地发送通知

## 脚本执行流程

1. 检查环境变量（账号密码、Telegram 配置）
2. 启动浏览器并设置参数
3. 访问登录页面并输入账号密码
4. 点击登录按钮
5. 跳转到签到页面（`https://cheapyun.com/#/app/point/earn`）
6. 尝试查找并点击签到按钮
7. 保存操作截图
8. 输出执行结果
9. 发送 Telegram 通知（如果配置了）
10. 关闭浏览器


## 许可证

MIT License
