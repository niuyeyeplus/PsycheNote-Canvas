/**
 * PsycheNote Canvas 一键启动脚本
 * 自动安装依赖并启动前后端服务
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');

/**
 * 执行命令并返回 Promise
 */
function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: options.cwd || PROJECT_ROOT, ...options }, (error, stdout, stderr) => {
      if (error && !options.ignoreError) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/**
 * 检查命令是否存在
 */
function commandExists(command) {
  return new Promise(resolve => {
    exec(
      `${command} --version`,
      { timeout: 5000 },
      () => resolve(false),
      () => resolve(true)
    );
  });
}

/**
 * 检查目录是否存在
 */
function dirExists(dir) {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

/**
 * 打印带颜色的日志
 */
function log(type, message) {
  const colors = {
    ok: '\x1b[32m',
    info: '\x1b[36m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[type]}[${type.toUpperCase()}]${colors.reset} ${message}`);
}

/**
 * 主启动流程
 */
async function main() {
  console.log('\n========================================');
  console.log('  PsycheNote Canvas 一键启动脚本');
  console.log('========================================\n');

  // 检测 Node.js
  log('info', '检查 Node.js...');
  try {
    const { stdout } = await execCommand('node -v');
    log('ok', `检测到 Node.js ${stdout.trim()}`);
  } catch {
    log('error', '未检测到 Node.js！请先从 https://nodejs.org 下载安装');
    process.exit(1);
  }

  // 安装前端依赖
  log('info', '检查前端依赖...');
  if (!dirExists(path.join(PROJECT_ROOT, 'node_modules'))) {
    log('warn', '正在安装前端依赖...');
    try {
      await execCommand('npm install');
      log('ok', '前端依赖安装完成');
    } catch (e) {
      log('error', `前端依赖安装失败: ${e.message}`);
      process.exit(1);
    }
  } else {
    log('ok', '前端依赖已安装');
  }

  // 安装后端依赖
  log('info', '检查后端依赖...');
  if (!dirExists(path.join(BACKEND_DIR, 'node_modules'))) {
    log('warn', '正在安装后端依赖...');
    try {
      await execCommand('npm install', { cwd: BACKEND_DIR });
      log('ok', '后端依赖安装完成');
    } catch (e) {
      log('error', `后端依赖安装失败: ${e.message}`);
      process.exit(1);
    }
  } else {
    log('ok', '后端依赖已安装');
  }

  // 启动后端
  log('info', '启动后端服务 (端口 3001)...');
  const backendProcess = spawn('node', ['server.js'], {
    cwd: BACKEND_DIR,
    detached: true,
    stdio: 'ignore',
  });
  backendProcess.unref();
  log('ok', '后端服务已启动');

  // 等待后端启动
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 启动前端
  log('info', '启动前端服务 (端口 3000)...');
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: PROJECT_ROOT,
    detached: true,
    stdio: 'ignore',
  });
  frontendProcess.unref();
  log('ok', '前端服务已启动');

  console.log('\n========================================');
  console.log('  启动完成！');
  console.log('  - 后端: http://localhost:3001');
  console.log('  - 前端: http://localhost:3000');
  console.log('========================================\n');

  // Windows 用户提示
  if (os.platform() === 'win32') {
    console.log('提示: 关闭此窗口后，服务将继续在后台运行');
    console.log('      如需停止服务，请打开任务管理器结束 node.exe 进程\n');
  } else {
    console.log('提示: 关闭终端将停止所有服务，按 Ctrl+C 可安全停止\n');
  }
}

main().catch(e => {
  log('error', `启动失败: ${e.message}`);
  process.exit(1);
});
