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
    
    // 截图：登录页面
    console.log('2.1 保存登录页面截图...');
    await page.screenshot({ path: path.join(screenshotDir, '1-login-page.png'), fullPage: true });
    
    // 输入账号
    console.log('3. 正在输入账号...');
    await page.type('input[type="text"]', username, { delay: 100 });
    
    // 输入密码
    console.log('4. 正在输入密码...');
    await page.type('input[type="password"]', password, { delay: 100 });
    
    // 截图：输入账号密码后
    console.log('4.1 保存输入账号密码后截图...');
    await page.screenshot({ path: path.join(screenshotDir, '2-after-input.png'), fullPage: true });
    
    // 点击登录按钮
    console.log('5. 正在点击登录按钮...');
    await page.click('button[type="button"]');
    
    // 等待登录成功（等待页面跳转）
    console.log('6. 等待登录成功...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
    
    // 检查是否登录成功
    const pageTitle = await page.title();
    console.log('6.1 登录后页面标题：', pageTitle);
    
    // 截图：登录成功后
    console.log('6.2 保存登录成功后截图...');
    await page.screenshot({ path: path.join(screenshotDir, '3-after-login.png'), fullPage: true });
    
    // 尝试查找并点击积分中心（侧边栏第4个）
    console.log('7. 正在查找并点击积分中心...');
    let pointCenterClicked = false;
    
    // 等待侧边栏加载
    await page.waitForSelector('nav, .sidebar, .el-aside, .el-menu', { timeout: 30000 });
    
    // 尝试多种方法查找积分中心
    try {
      // 方法1：通过nth-child选择器
      console.log('7.1 尝试通过nth-child选择器查找积分中心...');
      await page.click('.el-menu > li:nth-child(4), .sidebar > li:nth-child(4), nav > li:nth-child(4)');
      pointCenterClicked = true;
      console.log('7.1 积分中心点击成功');
    } catch (e) {
      console.log('7.1 方法1失败：', e.message);
      
      try {
        // 方法2：通过索引查找
        console.log('7.2 尝试通过索引查找积分中心...');
        const menuItems = await page.$$('.el-menu-item, .el-submenu__title, .nav-item, li');
        if (menuItems.length >= 4) {
          await menuItems[3].click();
          pointCenterClicked = true;
          console.log('7.2 积分中心点击成功');
        }
      } catch (e) {
        console.log('7.2 方法2失败：', e.message);
        
        try {
          // 方法3：通过文本查找
          console.log('7.3 尝试通过文本查找积分中心...');
          const elements = await page.$$('*');
          for (let element of elements) {
            const text = await element.evaluate(el => el.textContent);
            if (text && text.includes('积分中心')) {
              await element.click();
              pointCenterClicked = true;
              console.log('7.3 积分中心点击成功');
              break;
            }
          }
        } catch (e) {
          console.log('7.3 方法3失败：', e.message);
        }
      }
    }
    
    if (!pointCenterClicked) {
      console.log('7.4 积分中心未找到或点击失败');
    }
    
    // 等待积分中心加载
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 截图：点击积分中心后
    console.log('7.5 保存点击积分中心后截图...');
    await page.screenshot({ path: path.join(screenshotDir, '4-after-point-center.png'), fullPage: true });
    
    // 尝试查找并点击任务大厅（积分中心下的第1个）
    console.log('8. 正在查找并点击任务大厅...');
    let taskHallClicked = false;
    
    // 尝试多种方法查找任务大厅
    try {
      // 方法1：查找子菜单
      console.log('8.1 尝试查找积分中心的子菜单...');
      const subMenus = await page.$$('.el-submenu .el-menu, .submenu, .dropdown-menu');
      for (let subMenu of subMenus) {
        const subMenuItems = await subMenu.$$('li, .el-menu-item, .nav-item');
        if (subMenuItems.length > 0) {
          await subMenuItems[0].click();
          taskHallClicked = true;
          console.log('8.1 任务大厅点击成功');
          break;
        }
      }
    } catch (e) {
      console.log('8.1 方法1失败：', e.message);
      
      try {
        // 方法2：通过nth-child选择器
        console.log('8.2 尝试通过nth-child选择器查找任务大厅...');
        await page.click('.el-submenu .el-menu > li:nth-child(1), .submenu > li:nth-child(1), .dropdown-menu > li:nth-child(1)');
        taskHallClicked = true;
        console.log('8.2 任务大厅点击成功');
      } catch (e) {
        console.log('8.2 方法2失败：', e.message);
        
        try {
          // 方法3：通过文本查找
          console.log('8.3 尝试通过文本查找任务大厅...');
          const elements = await page.$$('*');
          for (let element of elements) {
            const text = await element.evaluate(el => el.textContent);
            if (text && text.includes('任务大厅')) {
              await element.click();
              taskHallClicked = true;
              console.log('8.3 任务大厅点击成功');
              break;
            }
          }
        } catch (e) {
          console.log('8.3 方法3失败：', e.message);
        }
      }
    }
    
    if (!taskHallClicked) {
      console.log('8.4 任务大厅未找到或点击失败');
    }
    
    // 等待任务大厅加载
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // 截图：进入任务大厅后
    console.log('8.5 保存进入任务大厅后截图...');
    await page.screenshot({ path: path.join(screenshotDir, '5-after-task-hall.png'), fullPage: true });
    
    // 尝试查找并点击签到按钮
    console.log('9. 正在查找并点击签到按钮...');
    let signinClicked = false;
    
    // 尝试多种方法查找签到按钮
    try {
      // 方法1：通过文本查找
      console.log('9.1 尝试通过文本查找签到按钮...');
      const keywords = ['签到', '每日', '领取'];
      const elements = await page.$$('*');
      for (let element of elements) {
        const text = await element.evaluate(el => el.textContent);
        if (text) {
          for (let keyword of keywords) {
            if (text.includes(keyword)) {
              await element.click();
              signinClicked = true;
              console.log('9.1 签到按钮点击成功');
              break;
            }
          }
          if (signinClicked) break;
        }
      }
    } catch (e) {
      console.log('9.1 方法1失败：', e.message);
      
      try {
        // 方法2：查找按钮元素
        console.log('9.2 尝试查找按钮元素...');
        const buttons = await page.$$('button');
        for (let button of buttons) {
          const text = await button.evaluate(el => el.textContent);
          if (text && (text.includes('签到') || text.includes('领取'))) {
            await button.click();
            signinClicked = true;
            console.log('9.2 签到按钮点击成功');
            break;
          }
        }
      } catch (e) {
        console.log('9.2 方法2失败：', e.message);
        
        try {
          // 方法3：查找卡片元素
          console.log('9.3 尝试查找卡片元素...');
          const cards = await page.$$('.el-card, .card, .panel, .box');
          for (let card of cards) {
            const text = await card.evaluate(el => el.textContent);
            if (text && (text.includes('签到') || text.includes('每日'))) {
              await card.click();
              signinClicked = true;
              console.log('9.3 签到按钮点击成功');
              break;
            }
          }
        } catch (e) {
          console.log('9.3 方法3失败：', e.message);
        }
      }
    }
    
    if (!signinClicked) {
      console.log('9.4 签到按钮未找到或点击失败');
    }
    
    // 等待签到完成
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 截图：签到后
    console.log('9.5 保存签到后截图...');
    await page.screenshot({ path: path.join(screenshotDir, '6-after-signin.png'), fullPage: true });
    
    // 最终截图保存结果
    console.log('10. 正在保存最终结果截图...');
    await page.screenshot({ path: path.join(screenshotDir, 'signin-result.png'), fullPage: true });
    
    console.log('自动签到任务执行完成！');
    console.log('截图文件已保存到：', screenshotDir);
    console.log('截图文件说明：');
    console.log('1-login-page.png - 登录页面');
    console.log('2-after-input.png - 输入账号密码后');
    console.log('3-after-login.png - 登录成功后');
    console.log('4-after-point-center.png - 点击积分中心后');
    console.log('5-after-task-hall.png - 进入任务大厅后');
    console.log('6-after-signin.png - 点击签到按钮后');
    console.log('signin-result.png - 最终结果');
    
    // 输出执行状态
    console.log('\n执行状态总结：');
    console.log(`登录状态：成功（页面标题：${pageTitle}）`);
    console.log(`积分中心：${pointCenterClicked ? '成功' : '失败'}`);
    console.log(`任务大厅：${taskHallClicked ? '成功' : '失败'}`);
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
