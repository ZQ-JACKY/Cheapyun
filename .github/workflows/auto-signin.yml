name: 自动签到

on:
  schedule:
    # 每天 8:00 执行
    - cron: '0 0 * * *'
  workflow_dispatch:

jobs:
  signin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: 设置 Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: 安装依赖
        run: npm install puppeteer
      
      - name: 执行签到
        run: node signin.js
        env:
          USERNAME: ${{ secrets.USERNAME }}
          PASSWORD: ${{ secrets.PASSWORD }}
      
      - name: 上传截图
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: screenshots/
