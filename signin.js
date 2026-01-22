const puppeteer = require('puppeteer');

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
  
  try {
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
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // 设置视口
    await page.setViewport({ width: 1366, height: 768 });
    
    // 访问网站
    console.log('正在访问 https://cheapyun.com/#/login');
    await page.goto('https://cheapyun.com/#/login', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // 等待登录页面加载
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 输入账号
    console.log('正在输入账号...');
    await page.evaluate((user) => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.value = user;
        // 触发输入事件
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, username);
    
    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 输入密码
    console.log('正在输入密码...');
    await page.evaluate((pass) => {
      const input = document.querySelector('input[type="password"]');
      if (input) {
        input.value = pass;
        // 触发输入事件
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, password);
    
    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 点击登录按钮
    console.log('正在点击登录按钮...');
    await page.evaluate(() => {
      const button = document.querySelector('button[type="button"]');
      if (button) {
        button.click();
      }
    });
    
    // 等待登录成功
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 检查是否登录成功
    const pageTitle = await page.title();
    console.log('登录后页面标题：', pageTitle);
    
    // 点击积分中心
    console.log('正在点击积分中心...');
    await page.evaluate(() => {
      // 尝试通过文本内容查找积分中心
      const links = document.querySelectorAll('a');
      for (let link of links) {
        if (link.textContent.includes('积分中心')) {
          link.click();
          return;
        }
      }
      // 尝试通过href查找
      const pointLinks = document.querySelectorAll('a[href*="point"]');
      if (pointLinks.length > 0) {
        pointLinks[0].click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 点击任务大厅
    console.log('正在点击任务大厅...');
    await page.evaluate(() => {
      // 尝试通过文本内容查找任务大厅
      const links = document.querySelectorAll('a');
      for (let link of links) {
        if (link.textContent.includes('任务大厅')) {
          link.click();
          return;
        }
      }
      // 尝试通过href查找
      const taskLinks = document.querySelectorAll('a[href*="task"]');
      if (taskLinks.length > 0) {
        taskLinks[0].click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 点击签到按钮
    console.log('正在点击签到按钮...');
    await page.evaluate(() => {
      // 尝试通过文本内容查找签到按钮
      const buttons = document.querySelectorAll('button');
      for (let button of buttons) {
        if (button.textContent.includes('签到')) {
          button.click();
          return;
        }
      }
      // 尝试其他元素类型
      const elements = document.querySelectorAll('*');
      for (let element of elements) {
        if (element.textContent.includes('签到') && element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
          element.click();
          return;
        }
      }
    });
    
    // 等待签到完成
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 截图保存结果
    console.log('正在保存签到结果截图...');
    await page.screenshot({ path: 'signin-result.png', fullPage: true });
    
    console.log('自动签到任务执行完成！');
    
  } catch (error) {
    console.error('执行过程中发生错误：', error);
    
    // 出错时也截图
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          const currentPage = pages[0];
          await currentPage.screenshot({ path: 'signin-error.png', fullPage: true });
        }
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
