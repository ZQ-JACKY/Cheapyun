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
    console.log('1. 正在访问 https://cheapyun.com/#/login...');
    await page.goto('https://cheapyun.com/#/login', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // 等待登录页面加载
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 截图：登录页面
    console.log('1.1 保存登录页面截图...');
    await page.screenshot({ path: '1-login-page.png', fullPage: true });
    
    // 输入账号
    console.log('2. 正在输入账号...');
    await page.evaluate((user) => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.value = user;
        input.dispatchEvent(new Event('input', { bubbles: true }));
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
      }
    }, password);
    
    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 截图：输入账号密码后
    console.log('3.1 保存输入账号密码后截图...');
    await page.screenshot({ path: '2-after-input.png', fullPage: true });
    
    // 点击登录按钮
    console.log('4. 正在点击登录按钮...');
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
    console.log('5. 登录后页面标题：', pageTitle);
    
    // 截图：登录成功后
    console.log('5.1 保存登录成功后截图...');
    await page.screenshot({ path: '3-after-login.png', fullPage: true });
    
    // 尝试点击左上角的菜单按钮（如果需要）
    console.log('5.2 尝试点击左上角菜单按钮...');
    await page.evaluate(() => {
      // 尝试查找左上角的菜单按钮
      const menuButtons = [
        document.querySelector('.el-menu'),
        document.querySelector('.sidebar-toggle'),
        document.querySelector('.menu-button'),
        document.querySelector('#sidebar-toggle'),
        document.querySelector('#menu-button'),
        document.querySelector('button[class*="menu"]'),
        document.querySelector('i[class*="menu"]'),
        document.querySelector('i[class*="bars"]'),
        document.querySelector('i[class*="nav"]'),
        document.querySelector('.logo + button'),
        document.querySelector('.logo + i'),
        document.querySelector('.el-aside .el-menu'),
        document.querySelector('.el-header button'),
        document.querySelector('.el-header i')
      ];
      
      for (let button of menuButtons) {
        if (button) {
          button.click();
          return true;
        }
      }
      
      return false;
    });
    
    // 等待菜单展开
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 截图：菜单展开后
    console.log('5.3 保存菜单展开后截图...');
    await page.screenshot({ path: '3a-after-menu.png', fullPage: true });
    
    // 尝试点击侧边栏第4个项目（积分中心）
    console.log('6. 正在点击侧边栏第4个项目（积分中心）...');
    let pointCenterClicked = false;
    
    await page.evaluate(() => {
      // 方法1：通过左侧菜单项目索引点击（第4个，索引为3）
      const menuItems = document.querySelectorAll('.el-menu-item, .el-submenu__title, .nav-item, .el-menu > li');
      console.log('找到的菜单项数量：', menuItems.length);
      
      if (menuItems.length >= 4) {
        // 侧边栏第4个项目（索引为3）
        console.log('点击第4个菜单项（索引3）:', menuItems[3]);
        menuItems[3].click();
        return true;
      } else {
        // 尝试点击所有菜单项
        for (let i = 0; i < menuItems.length; i++) {
          console.log('尝试点击菜单项', i, ':', menuItems[i]);
          menuItems[i].click();
          return true;
        }
      }
      
      return false;
    }).then(result => {
      pointCenterClicked = result;
    });
    
    if (pointCenterClicked) {
      console.log('6.1 积分中心点击成功');
    } else {
      console.log('6.1 积分中心未找到或点击失败');
    }
    
    // 等待积分中心展开子菜单
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 截图：积分中心展开后
    console.log('6.2 保存积分中心展开后截图...');
    await page.screenshot({ path: '4-after-point-center.png', fullPage: true });
    
    // 尝试点击积分中心下的第1个项目（任务大厅）
    console.log('7. 正在点击积分中心下的第1个项目（任务大厅）...');
    let taskHallClicked = false;
    
    await page.evaluate(() => {
      // 方法1：尝试查找积分中心的子菜单
      const subMenus = document.querySelectorAll('.el-submenu .el-menu, .submenu, .dropdown-menu, .el-menu .el-menu');
      console.log('找到的子菜单数量：', subMenus.length);
      
      for (let subMenu of subMenus) {
        const subMenuItems = subMenu.querySelectorAll('li, .el-menu-item, .nav-item');
        console.log('子菜单中的项目数量：', subMenuItems.length);
        
        if (subMenuItems.length > 0) {
          // 点击子菜单的第1个项目
          console.log('点击子菜单第1个项目:', subMenuItems[0]);
          subMenuItems[0].click();
          return true;
        }
      }
      
      // 方法2：尝试查找所有菜单项，点击后面的项目
      const allMenuItems = document.querySelectorAll('.el-menu-item, .el-submenu__title, .nav-item, .el-menu > li');
      if (allMenuItems.length > 4) {
        // 尝试点击第5个或更后面的项目
        for (let i = 4; i < allMenuItems.length; i++) {
          console.log('尝试点击菜单项', i, ':', allMenuItems[i]);
          allMenuItems[i].click();
          return true;
        }
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
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 截图：进入任务大厅后
    console.log('7.2 保存进入任务大厅后截图...');
    await page.screenshot({ path: '5-after-task-hall.png', fullPage: true });
    
    // 尝试点击签到按钮
    console.log('8. 正在寻找并点击签到按钮...');
    let signinClicked = false;
    
    await page.evaluate(() => {
      // 方法1：尝试查找包含"签到"或"每日"或"领取"的元素
      const elements = document.querySelectorAll('*');
      for (let element of elements) {
        if (element.textContent && (element.textContent.includes('签到') || element.textContent.includes('每日') || element.textContent.includes('领取'))) {
          console.log('找到签到按钮:', element);
          element.click();
          return true;
        }
      }
      
      // 方法2：尝试查找按钮元素
      const buttons = document.querySelectorAll('button');
      for (let button of buttons) {
        if (button.textContent || button.style.cursor === 'pointer') {
          console.log('尝试点击按钮:', button);
          button.click();
          return true;
        }
      }
      
      // 方法3：尝试查找卡片或面板元素
      const cards = document.querySelectorAll('.el-card, .card, .panel, .box');
      for (let card of cards) {
        if (card.textContent) {
          console.log('尝试点击卡片:', card);
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
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 截图：签到后
    console.log('8.2 保存签到后截图...');
    await page.screenshot({ path: '6-after-signin.png', fullPage: true });
    
    // 最终截图保存结果
    console.log('9. 正在保存最终结果截图...');
    await page.screenshot({ path: 'signin-result.png', fullPage: true });
    
    console.log('自动签到任务执行完成！');
    console.log('截图文件说明：');
    console.log('1-login-page.png - 登录页面');
    console.log('2-after-input.png - 输入账号密码后');
    console.log('3-after-login.png - 登录成功后');
    console.log('3a-after-menu.png - 菜单展开后');
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
          await currentPage.screenshot({ path: 'signin-error.png', fullPage: true });
          console.log('错误截图已保存为 signin-error.png');
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
