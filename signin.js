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
    
    // 点击积分中心
    console.log('6. 正在点击积分中心...');
    let pointCenterClicked = false;
    
    // 尝试多种方法查找积分中心
    await page.evaluate(() => {
      // 方法1：通过文本内容查找
      const elements = document.querySelectorAll('*');
      for (let element of elements) {
        if (element.textContent.trim() === '积分中心' && element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
          element.click();
          return true;
        }
      }
      
      // 方法2：通过包含文本查找
      for (let element of elements) {
        if (element.textContent.includes('积分中心') && element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
          element.click();
          return true;
        }
      }
      
      // 方法3：通过class或id查找
      const possibleSelectors = [
        '.point-center', '.integral-center', '#point-center', '#integral-center',
        'a[href*="point"]', 'a[href*="integral"]',
        'li:contains("积分中心")', 'div:contains("积分中心")'
      ];
      
      for (let selector of possibleSelectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            element.click();
            return true;
          }
        } catch (e) {}
      }
      
      return false;
    }).then(result => {
      pointCenterClicked = result;
    });
    
    if (pointCenterClicked) {
      console.log('6.1 积分中心点击成功');
    } else {
      console.log('6.1 积分中心未找到或点击失败');
      // 尝试使用更广泛的查找方法
      await page.evaluate(() => {
        // 查找所有可点击元素
        const clickableElements = document.querySelectorAll('a, button, [role="button"]');
        for (let element of clickableElements) {
          if (element.textContent.includes('积分') || element.textContent.includes('point') || element.textContent.includes('integral')) {
            element.click();
            return true;
          }
        }
        return false;
      }).then(result => {
        if (result) {
          console.log('6.2 尝试其他方法点击积分中心成功');
          pointCenterClicked = true;
        }
      });
    }
    
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 截图：点击积分中心后
    console.log('6.3 保存点击积分中心后截图...');
    await page.screenshot({ path: '4-after-point-center.png', fullPage: true });
    
    // 点击任务大厅
    console.log('7. 正在点击任务大厅...');
    let taskHallClicked = false;
    
    // 尝试多种方法查找任务大厅
    await page.evaluate(() => {
      // 方法1：通过文本内容查找
      const elements = document.querySelectorAll('*');
      for (let element of elements) {
        if (element.textContent.trim() === '任务大厅' && element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
          element.click();
          return true;
        }
      }
      
      // 方法2：通过包含文本查找
      for (let element of elements) {
        if (element.textContent.includes('任务大厅') && element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
          element.click();
          return true;
        }
      }
      
      // 方法3：通过class或id查找
      const possibleSelectors = [
        '.task-hall', '.task-center', '#task-hall', '#task-center',
        'a[href*="task"]', 'a[href*="mission"]',
        'li:contains("任务大厅")', 'div:contains("任务大厅")'
      ];
      
      for (let selector of possibleSelectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            element.click();
            return true;
          }
        } catch (e) {}
      }
      
      return false;
    }).then(result => {
      taskHallClicked = result;
    });
    
    if (taskHallClicked) {
      console.log('7.1 任务大厅点击成功');
    } else {
      console.log('7.1 任务大厅未找到或点击失败');
      // 尝试使用更广泛的查找方法
      await page.evaluate(() => {
        // 查找所有可点击元素
        const clickableElements = document.querySelectorAll('a, button, [role="button"]');
        for (let element of clickableElements) {
          if (element.textContent.includes('任务') || element.textContent.includes('task') || element.textContent.includes('mission')) {
            element.click();
            return true;
          }
        }
        return false;
      }).then(result => {
        if (result) {
          console.log('7.2 尝试其他方法点击任务大厅成功');
          taskHallClicked = true;
        }
      });
    }
    
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 截图：进入任务大厅后
    console.log('7.3 保存进入任务大厅后截图...');
    await page.screenshot({ path: '5-after-task-hall.png', fullPage: true });
    
    // 点击签到按钮
    console.log('8. 正在点击签到按钮...');
    let signinClicked = false;
    
    // 尝试多种方法查找签到按钮
    await page.evaluate(() => {
      // 方法1：通过文本内容查找
      const elements = document.querySelectorAll('*');
      for (let element of elements) {
        if (element.textContent.trim() === '签到' && element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
          element.click();
          return true;
        }
      }
      
      // 方法2：通过包含文本查找
      for (let element of elements) {
        if (element.textContent.includes('签到') && element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
          element.click();
          return true;
        }
      }
      
      // 方法3：通过class或id查找
      const possibleSelectors = [
        '.signin', '.checkin', '#signin', '#checkin',
        'button:contains("签到")', 'a:contains("签到")'
      ];
      
      for (let selector of possibleSelectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            element.click();
            return true;
          }
        } catch (e) {}
      }
      
      return false;
    }).then(result => {
      signinClicked = result;
    });
    
    if (signinClicked) {
      console.log('8.1 签到按钮点击成功');
    } else {
      console.log('8.1 签到按钮未找到或点击失败');
      // 尝试使用更广泛的查找方法
      await page.evaluate(() => {
        // 查找所有可点击元素
        const clickableElements = document.querySelectorAll('a, button, [role="button"]');
        for (let element of clickableElements) {
          if (element.textContent.includes('签') || element.textContent.includes('sign')) {
            element.click();
            return true;
          }
        }
        return false;
      }).then(result => {
        if (result) {
          console.log('8.2 尝试其他方法点击签到按钮成功');
          signinClicked = true;
        }
      });
    }
    
    // 等待签到完成
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 截图：签到后
    console.log('8.3 保存签到后截图...');
    await page.screenshot({ path: '6-after-signin.png', fullPage: true });
    
    // 最终截图保存结果
    console.log('9. 正在保存最终结果截图...');
    await page.screenshot({ path: 'signin-result.png', fullPage: true });
    
    console.log('自动签到任务执行完成！');
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
