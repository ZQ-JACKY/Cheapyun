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
  
  try {
    // 创建截图目录
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    // 检测是否在 GitHub Actions 中运行
    const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
    console.log(`运行环境：${isGitHubActions ? 'GitHub Actions' : '本地'}`);
    
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
    
    const page = await browser.newPage();
    
    // 设置视口
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 防止被检测为机器人
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });
      
      // 其他防检测措施
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
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 截图：登录页面
    console.log('1.1 保存登录页面截图...');
    await page.screenshot({ path: path.join(screenshotDir, '1-login-page.png'), fullPage: true });
    
    // 输入账号
    console.log('2. 正在输入账号...');
    await page.evaluate((user) => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.value = user;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, username);
    
    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 输入密码
    console.log('3. 正在输入密码...');
    await page.evaluate((pass) => {
      const input = document.querySelector('input[type="password"]');
      if (input) {
        input.value = pass;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, password);
    
    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 截图：输入账号密码后
    console.log('3.1 保存输入账号密码后截图...');
    await page.screenshot({ path: path.join(screenshotDir, '2-after-input.png'), fullPage: true });
    
    // 点击登录按钮
    console.log('4. 正在点击登录按钮...');
    await page.evaluate(() => {
      const button = document.querySelector('button[type="button"]');
      if (button) {
        button.click();
      }
    });
    
    // 等待登录成功
    console.log('5. 等待登录成功...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 检查是否登录成功
    const pageTitle = await page.title();
    console.log('5.1 登录后页面标题：', pageTitle);
    
    // 截图：登录成功后
    console.log('5.2 保存登录成功后截图...');
    await page.screenshot({ path: path.join(screenshotDir, '3-after-login.png'), fullPage: true });
    
    // 尝试点击侧边栏第4个项目（积分中心）
    console.log('6. 正在点击侧边栏第4个项目（积分中心）...');
    let pointCenterClicked = false;
    
    await page.evaluate(() => {
      // 查找所有侧边栏菜单项
      const menuItems = Array.from(document.querySelectorAll('.el-menu-item, .el-submenu__title, .nav-item, li'));
      
      // 过滤出可见的菜单项
      const visibleItems = menuItems.filter(item => {
        const style = window.getComputedStyle(item);
        return style.display !== 'none' && style.visibility === 'visible';
      });
      
      // 点击第4个菜单项（索引为3）
      if (visibleItems.length >= 4) {
        visibleItems[3].click();
        return true;
      }
      
      // 尝试其他选择器
      const sidebarItems = Array.from(document.querySelectorAll('.sidebar-item, .menu-item, .nav-item'));
      if (sidebarItems.length >= 4) {
        sidebarItems[3].click();
        return true;
      }
      
      return false;
    }).then(result => {
      pointCenterClicked = result;
    });
    
    if (pointCenterClicked) {
      console.log('6.1 积分中心点击成功');
    } else {
      console.log('6.1 积分中心未找到或点击失败');
      // 尝试其他方法
      await page.evaluate(() => {
        // 尝试点击左侧边栏的所有可能元素
        const leftSidebar = document.querySelector('.el-aside, .sidebar, #sidebar, .left-sidebar');
        if (leftSidebar) {
          const elements = leftSidebar.querySelectorAll('*');
          if (elements.length >= 4) {
            elements[3].click();
          }
        }
      });
    }
    
    // 等待积分中心展开
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 截图：积分中心展开后
    console.log('6.2 保存积分中心展开后截图...');
    await page.screenshot({ path: path.join(screenshotDir, '4-after-point-center.png'), fullPage: true });
    
    // 尝试点击积分中心下的第1个项目（任务大厅）
    console.log('7. 正在点击积分中心下的第1个项目（任务大厅）...');
    let taskHallClicked = false;
    
    await page.evaluate(() => {
      // 尝试查找积分中心的子菜单
      const subMenus = Array.from(document.querySelectorAll('.el-submenu .el-menu, .submenu, .dropdown-menu, .el-menu .el-menu, .children-menu'));
      
      for (let subMenu of subMenus) {
        const subMenuItems = Array.from(subMenu.querySelectorAll('li, .el-menu-item, .nav-item, .menu-item'));
        if (subMenuItems.length > 0) {
          // 点击子菜单的第1个项目
          subMenuItems[0].click();
          return true;
        }
      }
      
      // 尝试查找所有可见的菜单项，点击第5个（假设是任务大厅）
      const allMenuItems = Array.from(document.querySelectorAll('.el-menu-item, .el-submenu__title, .nav-item, li, .menu-item'));
      const visibleItems = allMenuItems.filter(item => {
        const style = window.getComputedStyle(item);
        return style.display !== 'none' && style.visibility === 'visible';
      });
      
      if (visibleItems.length >= 5) {
        visibleItems[4].click();
        return true;
      }
      
      return false;
    }).then(result => {
      taskHallClicked = result;
    });
    
    if (taskHallClicked) {
      console.log('7.1 任务大厅点击成功');
    } else {
      console.log('7.1 任务大厅未找到或点击失败');
    }
    
    // 等待任务大厅加载
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // 截图：进入任务大厅后
    console.log('7.2 保存进入任务大厅后截图...');
    await page.screenshot({ path: path.join(screenshotDir, '5-after-task-hall.png'), fullPage: true });
    
    // 尝试点击签到按钮
    console.log('8. 正在寻找并点击签到按钮...');
    let signinClicked = false;
    
    await page.evaluate(() => {
      // 方法1：尝试查找包含特定文本的元素
      const keywords = ['签到', '每日', '领取', 'sign', 'daily', 'checkin'];
      const elements = Array.from(document.querySelectorAll('*'));
      
      for (let element of elements) {
        if (element.textContent) {
          const text = element.textContent.toLowerCase();
          for (let keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
              element.click();
              return true;
            }
          }
        }
      }
      
      // 方法2：尝试点击所有按钮
      const buttons = Array.from(document.querySelectorAll('button'));
      for (let button of buttons) {
        if (button.style.cursor === 'pointer' || button.classList.contains('el-button') || button.classList.contains('btn')) {
          button.click();
          return true;
        }
      }
      
      // 方法3：尝试点击卡片元素
      const cards = Array.from(document.querySelectorAll('.el-card, .card, .panel, .box, .task-card'));
      for (let card of cards) {
        if (card.textContent) {
          card.click();
          return true;
        }
      }
      
      return false;
    }).then(result => {
      signinClicked = result;
    });
    
    if (signinClicked) {
      console.log('8.1 签到按钮点击成功');
    } else {
      console.log('8.1 签到按钮未找到或点击失败');
    }
    
    // 等待签到完成
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 截图：签到后
    console.log('8.2 保存签到后截图...');
    await page.screenshot({ path: path.join(screenshotDir, '6-after-signin.png'), fullPage: true });
    
    // 最终截图保存结果
    console.log('9. 正在保存最终结果截图...');
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
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          const currentPage = pages[0];
          const screenshotDir = path.join(__dirname, 'screenshots');
          if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
          }
          await currentPage.screenshot({ path: path.join(screenshotDir, 'signin-error.png'), fullPage: true });
          console.log('错误截图已保存到：', path.join(screenshotDir, 'signin-error.png'));
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
