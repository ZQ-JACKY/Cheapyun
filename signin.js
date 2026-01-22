const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function autoSignin() {
  console.log('开始执行自动签到任务...');
  
  // 读取环境变量
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  
  if (!username || !password) {
    console.error('错误：未设置账号密码环境变量');
    return;
  }
  
  console.log('账号：', username);
  
  let browser = null;
  let page = null;
  
  try {
    // 创建截图目录
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled',
        '--no-proxy-server',
        '--lang=zh-CN'
      ]
    });
    
    page = await browser.newPage();
    
    // 设置视口
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 防止被检测为机器人
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });
      
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => {
        if (parameters.name === 'notifications') {
          return Promise.resolve({ state: Notification.permission });
        }
        return originalQuery(parameters);
      };
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['zh-CN', 'zh', 'en']
      });
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });
    });
    
    // 访问登录页面
    console.log('1. 正在访问 https://cheapyun.com/#/login...');
    await page.goto('https://cheapyun.com/#/login', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // 等待登录页面加载
    console.log('2. 等待登录页面元素加载...');
    await page.waitForSelector('input[type="text"]', { timeout: 30000 });
    await page.waitForSelector('input[type="password"]', { timeout: 30000 });
    await page.waitForSelector('button[type="button"]', { timeout: 30000 });
    
    // 输入账号
    console.log('3. 正在输入账号...');
    await page.type('input[type="text"]', username, { delay: 100 });
    
    // 输入密码
    console.log('4. 正在输入密码...');
    await page.type('input[type="password"]', password, { delay: 100 });
    
    // 点击登录按钮
    console.log('5. 正在点击登录按钮...');
    await page.click('button[type="button"]');
    
    // 等待登录成功
    console.log('6. 等待登录成功...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 直接跳转到签到页面
    console.log('7. 正在跳转到签到页面...');
    await page.goto('https://cheapyun.com/#/app/point/earn', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // 等待页面加载
    console.log('8. 等待签到页面加载...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 截图：签到页面
    console.log('8.1 保存签到页面截图...');
    await page.screenshot({ path: path.join(screenshotDir, '1-signin-page.png'), fullPage: true });
    
    // 使用提供的XPath点击签到按钮
    console.log('9. 正在点击签到按钮...');
    let signinClicked = false;
    
    try {
      // 使用提供的XPath
      const xpath = '//*[@id="app"]/section/div[2]/div/div[1]/div/section/div/div[1]/div/div[2]/div/div[3]/div/div/div/div[2]/a';
      await page.waitForXPath(xpath, { timeout: 30000 });
      const [element] = await page.$x(xpath);
      if (element) {
        await element.click();
        signinClicked = true;
        console.log('9.1 签到按钮点击成功');
      }
    } catch (e) {
      console.log('9.1 签到按钮点击失败：', e.message);
    }
    
    // 等待签到完成
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 截图：签到后
    console.log('10. 保存签到后截图...');
    await page.screenshot({ path: path.join(screenshotDir, '2-after-signin.png'), fullPage: true });
    
    console.log('自动签到任务执行完成！');
    console.log('截图文件已保存到：', screenshotDir);
    console.log('截图文件说明：');
    console.log('1-signin-page.png - 签到页面');
    console.log('2-after-signin.png - 签到后结果');
    
    // 输出执行状态
    console.log('\n执行状态总结：');
    console.log(`签到操作：${signinClicked ? '成功' : '失败'}`);
    
  } catch (error) {
    console.error('执行过程中发生错误：', error);
    
    // 出错时也截图
    if (page) {
      try {
        const screenshotDir = path.join(__dirname, 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        await page.screenshot({ path: path.join(screenshotDir, 'signin-error.png'), fullPage: true });
        console.log('错误截图已保存到：', path.join(screenshotDir, 'signin-error.png'));
      } catch (e) {
        console.error('截图失败：', e);
      }
    }
    
  } finally {
    // 关闭浏览器
    if (browser) {
      await browser.close();
      console.log('浏览器已关闭');
    }
  }
}

// 执行签到
autoSignin();
