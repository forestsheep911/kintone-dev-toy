import { spawn } from 'child_process'
import { KintoneUploader } from './utils/kintone-client.js'
import { loadConfig } from './utils/config.js'
import chalk from 'chalk'
import { promisify } from 'util'
import { exec } from 'child_process'

const execAsync = promisify(exec)

async function startHotDevServer() {
  console.log(chalk.blue('🔥'), 'Kintone 真正热更新开发模式启动中...')
  console.log()

  // 加载配置
  const config = await loadConfig()
  if (!config) {
    console.error(chalk.red('❌'), '配置加载失败，请先运行 npm run setup')
    process.exit(1)
  }

  // 显示配置信息
  console.log(chalk.blue('ℹ️'), '使用用户名密码认证')
  console.log()
  console.log(chalk.cyan('📋'), '当前配置:')
  console.log(`   环境: ${config.env}`)
  console.log(`   域名: ${config.domain}`)
  console.log(`   应用ID: ${config.appId}`)
  console.log(`   认证方式: ${config.username ? '用户名密码' : 'API Token'}`)
  if (config.username) {
    console.log(`   用户名: ${config.username}`)
    console.log(`   密码: ${config.password ? '***' + config.password.slice(-2) : 'null'}`)
  }
  console.log()

  // 初始化 Kintone 客户端
  const uploader = new KintoneUploader(config)

  // 测试连接
  console.log(chalk.blue('🔗'), '测试 Kintone 连接...')
  const connectionOk = await uploader.testConnection()
  if (!connectionOk) {
    console.error(chalk.red('❌'), '连接失败，请检查配置')
    process.exit(1)
  }

  // 获取本机 IP 地址
  let localIP = 'localhost' // 默认使用 localhost
  let useLocalhost = true
  
  try {
    // 检查是否已经安装了根证书
    const certPath = require('path').join(require('os').homedir(), '.vite-plugin-mkcert')
    console.log(chalk.blue('🔐'), '检查 HTTPS 证书配置...')
    
    if (!require('fs').existsSync(certPath)) {
      console.log(chalk.yellow('📋'), '首次使用 HTTPS 开发模式说明：')
      console.log(chalk.gray('   1. 系统将自动生成本地 HTTPS 证书'))
      console.log(chalk.gray('   2. 可能会弹出安全提示，请选择"允许"'))
      console.log(chalk.gray('   3. 证书将添加到系统信任列表（仅限本地开发）'))
      console.log(chalk.gray('   4. 首次配置后，以后不会再出现提示'))
      console.log()
    }
  } catch (error) {
    console.warn(chalk.yellow('⚠️'), '无法检查证书状态')
  }

  // 配置本地开发服务器设置
  const DEV_SERVER_PORT = 5173
  let actualPort = DEV_SERVER_PORT
  const DEV_SERVER_URL = `https://localhost:${DEV_SERVER_PORT}` // 使用 localhost

  console.log(chalk.green('🔧'), '配置 Kintone 应用使用本地 HTTPS 服务器...')
  console.log(chalk.gray(`   服务器地址: ${DEV_SERVER_URL}`))
  
  console.log(chalk.green('🚀'), '启动 Vite HTTPS 开发服务器...')
  console.log()

  // 启动 Vite 开发服务器
  const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', DEV_SERVER_PORT.toString()], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  })

  // 监听 Vite 输出以获取实际端口
  let serverReady = false
  let actualServerUrl = DEV_SERVER_URL

  viteProcess.stdout.on('data', (data) => {
    const output = data.toString()
    process.stdout.write(data)
    
    // 检测端口变化
    const portMatch = output.match(/Local:\s+https:\/\/localhost:(\d+)\//)
    if (portMatch && !serverReady) {
      actualPort = parseInt(portMatch[1])
      actualServerUrl = `https://localhost:${actualPort}`
      
      if (actualPort !== DEV_SERVER_PORT) {
        console.log(chalk.yellow('⚠️'), `端口 ${DEV_SERVER_PORT} 被占用，使用端口 ${actualPort}`)
        console.log(chalk.blue('🔄'), '重新配置 Kintone...')
        
        // 重新配置 Kintone 使用正确的端口
        setTimeout(async () => {
          try {
            await uploader.setupDevMode(config.appId, {
              desktop: `${actualServerUrl}/?type=desktop`,
              mobile: `${actualServerUrl}/?type=mobile`,
              config: `${actualServerUrl}/?type=config`
            })
            console.log(chalk.green('✅'), `已重新配置到端口 ${actualPort}`)
          } catch (error) {
            console.error(chalk.red('❌'), '重新配置失败:', error.message)
          }
        }, 2000)
      }
      serverReady = true
    }
  })

  viteProcess.stderr.on('data', (data) => {
    process.stderr.write(data)
  })

  // 如果端口未变化，执行初始配置
  setTimeout(async () => {
    if (actualPort === DEV_SERVER_PORT && !serverReady) {
      try {
        await uploader.setupDevMode(config.appId, {
          desktop: `${DEV_SERVER_URL}/?type=desktop`,
          mobile: `${DEV_SERVER_URL}/?type=mobile`,
          config: `${DEV_SERVER_URL}/?type=config`
        })
        
        console.log(chalk.green('✅'), '开发模式配置成功！')
        serverReady = true
      } catch (error) {
        console.error(chalk.red('❌'), '开发模式配置失败:', error.message)
        console.log()
        console.log(chalk.yellow('💡'), '可能的原因：')
        console.log(chalk.gray('   1. Kintone 无法访问你的本地 HTTPS 服务器'))
        console.log(chalk.gray('   2. 防火墙阻止了外部访问'))
        console.log(chalk.gray('   3. 证书不受信任（请检查浏览器证书设置）'))
        console.log()
        console.log(chalk.blue('🔄'), '切换到文件上传模式...')
        
        // 回退到文件上传模式
        await fallbackToUploadMode(config, uploader)
        return
      }
    }
  }, 3000)

  // 显示成功信息
  setTimeout(() => {
    if (serverReady) {
      console.log()
      console.log(chalk.green('🔥 真正的热更新已启动！'))
      console.log(chalk.blue('💡'), '特点：')
      console.log(chalk.yellow('   ⚡ 修改源代码后立即在 Kintone 中生效'))
      console.log(chalk.yellow('   🔄 无需上传，直接从本地加载'))
      console.log(chalk.yellow('   🚀 真正的毫秒级热更新'))
      console.log()
      console.log(chalk.cyan('🌐'), '访问链接:')
      console.log(`   本地 HTTPS 服务器: ${actualServerUrl}`)
      console.log(`   桌面端应用: https://${config.domain}/k/${config.appId}/`)
      console.log(`   移动端应用: https://${config.domain}/k/m/${config.appId}/`)
      console.log()
      console.log(chalk.blue('📋'), 'Kintone 后台配置的 URL:')
      console.log(chalk.gray(`   桌面端: ${actualServerUrl}/?type=desktop`))
      console.log(chalk.gray(`   移动端: ${actualServerUrl}/?type=mobile`))
      console.log(chalk.gray(`   配置页: ${actualServerUrl}/?type=config`))
      console.log()
      console.log(chalk.yellow('⚠️'), '注意: 开发完成后请运行 pnpm run build 部署到生产环境')
      console.log(chalk.gray('   按 Ctrl+C 停止开发服务器'))
    }
  }, 5000)

  // 处理进程退出
  const cleanup = async () => {
    console.log()
    console.log(chalk.yellow('🔄'), '正在清理开发环境...')
    
    // 恢复生产环境配置（清空自定义设置）
    try {
      await uploader.clearCustomization(config.appId)
      console.log(chalk.green('✅'), '已清理开发环境配置')
    } catch (error) {
      console.warn(chalk.yellow('⚠️'), '清理开发环境时出现警告:', error.message)
    }
    
    console.log(chalk.blue('👋'), '开发服务器已停止')
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  viteProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(chalk.red('❌'), `Vite 开发服务器异常退出，代码: ${code}`)
    }
    cleanup()
  })
}

// 回退到文件上传模式
async function fallbackToUploadMode(config, uploader) {
  console.log(chalk.blue('📤'), '启动文件上传模式...')
  
  // 动态导入原来的上传逻辑
  const { spawn } = await import('child_process')
  const chokidar = await import('chokidar')
  const { getDistFiles } = await import('./utils/config.js')

  // 启动 Vite 开发服务器 (watch mode)
  const viteProcess = spawn('npx', ['vite', 'build', '--watch'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  })

  // 监听 Vite 输出
  viteProcess.stdout.on('data', (data) => {
    process.stdout.write(data)
  })

  viteProcess.stderr.on('data', (data) => {
    process.stderr.write(data)
  })

  // 文件监听和上传逻辑
  const watcher = chokidar.watch('./dist/**/*.{js,css}', {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  })

  let isUploading = false
  let uploadTimeout = null
  let initialUploadDone = false

  const uploadFiles = async () => {
    if (isUploading) {
      clearTimeout(uploadTimeout)
      uploadTimeout = setTimeout(uploadFiles, 1000)
      return
    }

    try {
      isUploading = true
      console.log(chalk.yellow('\n📤 检测到文件变化，开始上传...'))

      const files = getDistFiles()
      if (Object.keys(files).length === 0) {
        console.log(chalk.yellow('⚠️  没有找到构建文件'))
        return
      }

      await uploader.uploadCustomization(config.appId, files)
      
      console.log(chalk.green('✅ 上传完成！'))
      console.log(chalk.cyan('🌐 访问链接:'))
      console.log(`   桌面端: https://${config.domain}/k/${config.appId}/`)
      console.log(`   移动端: https://${config.domain}/k/m/${config.appId}/`)
      console.log(chalk.blue('\n👀 继续监听文件变化...\n'))

    } catch (error) {
      console.error(chalk.red('❌ 上传失败:'), error.message)
    } finally {
      isUploading = false
    }
  }

  // 初始上传
  const performInitialUpload = () => {
    if (!initialUploadDone) {
      setTimeout(async () => {
        console.log(chalk.blue('\n🚀 执行初始上传...'))
        await uploadFiles()
        initialUploadDone = true
      }, 2000)
    }
  }

  // 设置文件变化监听
  watcher.on('change', () => {
    if (initialUploadDone) {
      clearTimeout(uploadTimeout)
      uploadTimeout = setTimeout(uploadFiles, 800)
    }
  })

  watcher.on('add', () => {
    if (initialUploadDone) {
      clearTimeout(uploadTimeout)
      uploadTimeout = setTimeout(uploadFiles, 800)
    }
  })

  // 等待 Vite 输出完成后执行初始上传
  let viteOutputTimer = null
  viteProcess.stdout.on('data', (data) => {
    const output = data.toString()
    
    if (output.includes('built in') && !initialUploadDone) {
      clearTimeout(viteOutputTimer)
      viteOutputTimer = setTimeout(performInitialUpload, 1000)
    }
  })

  console.log(chalk.green('✅ 文件上传模式已启动！'))
  console.log(chalk.blue('💡 修改源代码后会自动构建并上传到 Kintone'))
}

startHotDevServer().catch(console.error) 