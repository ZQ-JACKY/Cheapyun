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
    
    // 尝试多次跳转
    let跳转成功 = false;
    const max跳转尝试 = 3;
    
    for (let i = 1; i <= max跳转尝试; i++) {
      try {
        console.log(`7.1 第 ${i} 次尝试跳转...`);
        await page.goto('https://cheapyun.com/#/app/point/earn', {
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        
        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 检查当前URL
        const currentUrl = await page.url();
        console.log(`7.2 当前URL：${currentUrl}`);
        
        if (currentUrl.includes('point/earn')) {
          console.log('7.3 跳转成功！');
          跳转成功 = true;
          break;
        } else {
          console.log('7.4 跳转失败，等待重试...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (e) {
        console.log(`7.5 跳转出错：${e.message}`);
        if (i < max跳转尝试) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    if (!跳转成功) {
      console.log('7.6 多次跳转失败，尝试备用方案...');
      // 尝试使用evaluate执行跳转
      await page.evaluate(() => {
        window.location.href = 'https://cheapyun.com/#/app/point/earn';
      });
      await new Promise(resolve => setTimeout(resolve, 8000));
    }
    
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
      const xpath = '//*[@id="app"]/section/div[2]/div/div[1]/div/section/div/div[1]/div/div[2]/div/div[3]/div/div/div/div[2]/a';
      console.log('9.1 使用XPath：', xpath);
      
      // 使用evaluate方法来查找和点击元素
      console.log('9.2 尝试使用evaluate查找元素...');
      
      // 多次尝试
      const max尝试次数 = 10;
      const尝试间隔 = 3000;
      
      for (let attempt = 1; attempt <= max尝试次数; attempt++) {
        console.log(`9.3 尝试第 ${attempt} 次...`);
        
        // 使用evaluate执行XPath查找和点击
        const 点击成功 = await page.evaluate((xpath) => {
          try {
            const elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (elements.snapshotLength > 0) {
              const element = elements.snapshotItem(0);
              if (element) {
                // 检查元素是否可见
                const style = window.getComputedStyle(element);
                const isVisible = style.display !== 'none' && style.visibility === 'visible' && style.opacity !== '0';
                
                if (isVisible) {
                  element.click();
                  return true;
                } else {
                  console.log('元素存在但不可见');
                  return false;
                }
              }
            }
            return false;
          } catch (e) {
            console.log('查找元素出错：', e.message);
            return false;
          }
        }, xpath);
        
        if (点击成功) {
          signinClicked = true;
          console.log('9.4 签到按钮点击成功');
          break;
        } else {
          console.log('9.5 未找到签到按钮，等待重试...');
        }
        
        // 等待一段时间后重试
        if (attempt < max尝试次数) {
          await new Promise(resolve => setTimeout(resolve, 尝试间隔));
        }
      }
      
      if (!signinClicked) {
        console.log('9.6 多次尝试后仍未找到签到按钮');
        
        // 尝试查找包含签到文字的元素
        console.log('9.7 尝试通过文字查找签到按钮...');
        const 文字点击成功 = await page.evaluate(() => {
          const 关键词 = ['签到', '每日', '领取'];
          const 元素 = document.querySelectorAll('*');
          
          for (let el of 元素) {
            if (el.textContent) {
              for (let 关键词 of 关键词) {
                if (el.textContent.includes(关键词)) {
                  try {
                    el.click();
                    return true;
                  } catch (e) {
                    continue;
                  }
                }
              }
            }
          }
          return false;
        });
        
        if (文字点击成功) {
          signinClicked = true;
          console.log('9.8 通过文字查找并点击成功');
        }
      }
      
    } catch (e) {
      console.log('9.9 签到按钮点击失败：', e.message);
      
      // 输出更多调试信息
      try {
        const pageContent = await page.content();
        console.log('9.10 页面内容长度：', pageContent.length);
        console.log('9.11 保存详细错误截图...');
        await page.screenshot({ path: path.join(screenshotDir, 'signin-button-error.png'), fullPage: true });
        
        // 尝试查找页面中的所有链接和按钮
        console.log('9.12 查找页面中的所有可点击元素...');
        const可点击元素数量 = await page.evaluate(() => {
          return document.querySelectorAll('a, button').length;
        });
        console.log('9.13 找到可点击元素数量：', 可点击元素数量);
        
        // 尝试获取页面中包含"签到"或"领取"的元素
        console.log('9.14 查找包含签到相关文字的元素...');
        const相关元素 = await page.evaluate(() => {
          const结果 = [];
          const元素 = document.querySelectorAll('*');
          let找到数量 = 0;
          
          for (let el of 元素) {
            if (el.textContent && (el.textContent.includes('签到') || el.textContent.includes('领取'))) {
              结果.push(el.textContent.trim());
              找到数量++;
              if (找到数量 >= 5) break;
            }
          }
          return 结果;
        });
        
        console.log('9.15 找到相关元素：', 相关元素);
        
      } catch (debugError) {
        console.log('9.16 调试信息获取失败：', debugError.message);
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
