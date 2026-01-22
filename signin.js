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
    await new Promise(resolve => setTimeout(resolve, 10000)); // 增加等待时间
    
    // 获取页面状态信息
    const pageTitle = await page.title();
    const currentUrl = await page.url();
    console.log('8.1 页面标题：', pageTitle);
    console.log('8.2 当前URL：', currentUrl);
    
    // 截图：签到页面
    console.log('8.3 保存签到页面截图...');
    await page.screenshot({ path: path.join(screenshotDir, '1-signin-page.png'), fullPage: true });
    
    // 使用提供的XPath点击签到按钮
    console.log('9. 正在点击签到按钮...');
    let signinClicked = false;
    
    try {
      // 使用提供的XPath
      const xpath = '//*[@id="app"]/section/div[2]/div/div[1]/div/section/div/div[1]/div/div[2]/div/div[2]/div/div/div/div[2]/a';
      console.log('9.1 使用XPath：', xpath);
      
      // 多次尝试查找并点击元素
      const maxAttempts = 10;
      const attemptDelay = 3000;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`9.2 尝试第 ${attempt} 次...`);
        
        // 直接查找元素
        const [element] = await page.$x(xpath);
        
        if (element) {
          console.log('9.3 找到签到按钮，准备点击...');
          
          // 检查元素是否可见
          const isVisible = await page.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility === 'visible' && style.opacity !== '0';
          }, element);
          
          if (isVisible) {
            await element.click();
            signinClicked = true;
            console.log('9.4 签到按钮点击成功');
            break;
          } else {
            console.log('9.5 签到按钮存在但不可见');
          }
        } else {
          console.log('9.6 未找到签到按钮，等待重试...');
        }
        
        // 等待一段时间后重试
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, attemptDelay));
        }
      }
      
      if (!signinClicked) {
        console.log('9.7 多次尝试后仍未找到签到按钮');
      }
      
    } catch (e) {
      console.log('9.8 签到按钮点击失败：', e.message);
      
      // 输出更多调试信息
      try {
        const pageContent = await page.content();
        console.log('9.9 页面内容长度：', pageContent.length);
        console.log('9.10 保存详细错误截图...');
        await page.screenshot({ path: path.join(screenshotDir, 'signin-button-error.png'), fullPage: true });
        
        // 尝试查找页面中的所有链接和按钮
        console.log('9.11 查找页面中的所有可点击元素...');
        const clickableElements = await page.$$('a, button');
        console.log('9.12 找到可点击元素数量：', clickableElements.length);
        
        // 尝试获取页面中包含"签到"或"领取"的元素
        console.log('9.13 查找包含签到相关文字的元素...');
        const elements = await page.$$('*');
        let foundElements = 0;
        for (let element of elements) {
          try {
            const text = await element.evaluate(el => el.textContent);
            if (text && (text.includes('签到') || text.includes('领取'))) {
              console.log('9.14 找到相关元素：', text.trim());
              foundElements++;
              if (foundElements >= 5) break; // 只输出前5个
            }
          } catch (innerError) {
            // 忽略单个元素的错误
          }
        }
        
      } catch (debugError) {
        console.log('9.15 调试信息获取失败：', debugError.message);
      }
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
