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
    console.log('正在访问 https://cheapyun.com/#/login...');
    await page.goto('https://cheapyun.com/#/login', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // 等待登录页面加载
    await page.waitFor(3000);
    
    // 输入账号
    console.log('正在输入账号...');
    await page.type('input[type="text"]', username, { delay: 100 });
    
    // 输入密码
    console.log('正在输入密码...');
    await page.type('input[type="password"]', password, { delay: 100 });
    
    // 点击登录按钮
    console.log('正在点击登录按钮...');
    await page.click('button[type="button"]');
    
    // 等待登录成功
    await page.waitFor(5000);
    
    // 检查是否登录成功
    const pageTitle = await page.title();
    console.log('登录后页面标题：', pageTitle);
    
    // 点击积分中心
    console.log('正在点击积分中心...');
    // 使用XPath或其他选择器定位积分中心
    try {
      await page.waitForSelector('a[href*="point"]', { timeout: 10000 });
      await page.click('a[href*="point"]');
    } catch (e) {
      console.log('尝试使用XPath定位积分中心...');
      const pointCenterSelector = '//*[contains(text(), "积分中心")]';
      await page.waitForXPath(pointCenterSelector, { timeout: 10000 });
      const [pointCenterElement] = await page.$x(pointCenterSelector);
      if (pointCenterElement) {
        await pointCenterElement.click();
      }
    }
    
    await page.waitFor(3000);
    
    // 点击任务大厅
    console.log('正在点击任务大厅...');
    try {
      await page.waitForSelector('a[href*="task"]', { timeout: 10000 });
      await page.click('a[href*="task"]');
    } catch (e) {
      console.log('尝试使用XPath定位任务大厅...');
      const taskHallSelector = '//*[contains(text(), "任务大厅")]';
      await page.waitForXPath(taskHallSelector, { timeout: 10000 });
      const [taskHallElement] = await page.$x(taskHallSelector);
      if (taskHallElement) {
        await taskHallElement.click();
      }
    }
    
    await page.waitFor(3000);
    
    // 点击签到按钮
    console.log('正在点击签到按钮...');
    try {
      await page.waitForSelector('button:contains("签到")', { timeout: 10000 });
      await page.click('button:contains("签到")');
    } catch (e) {
      console.log('尝试使用XPath定位签到按钮...');
      const signinSelector = '//*[contains(text(), "签到")]';
      await page.waitForXPath(signinSelector, { timeout: 10000 });
      const [signinElement] = await page.$x(signinSelector);
      if (signinElement) {
        await signinElement.click();
      }
    }
    
    // 等待签到完成
    await page.waitFor(3000);
    
    // 截图保存结果
    console.log('正在保存签到结果截图...');
    await page.screenshot({ path: 'signin-result.png', fullPage: true });
    
    console.log('自动签到任务执行完成！');
    
  } catch (error) {
    console.error('执行过程中发生错误：', error);
    
    // 出错时也截图
    if (browser) {
      const page = (await browser.pages())[0];
      if (page) {
        await page.screenshot({ path: 'signin-error.png', fullPage: true });
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
