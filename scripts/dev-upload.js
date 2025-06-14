#!/usr/bin/env node

import { spawn } from 'child_process'
import { KintoneUploader } from './utils/kintone-client.js'
import { loadConfig, getDistFiles } from './utils/config.js'
import chalk from 'chalk'
import chokidar from 'chokidar'

async function startDevServer() {
  console.log(chalk.blue('🚀'), 'Kintone 开发环境启动中...')
  console.log()

  // 加载配置
  const config = await loadConfig()
  if (!config) {
    console.error(chalk.red('❌'), '配置加载失败，请先运行 npm run setup')
    process.exit(1)
  }

  // 显示配置信息
  console.log(chalk.blue('ℹ️'), '使用用户名密码认证（推荐用于开发模式）')
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

  console.log(chalk.green('🛠️'), '启动 Vite 开发服务器和文件监听...')
  console.log()

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

  // 监听构建输出目录
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
      // 如果正在上传，重置定时器
      clearTimeout(uploadTimeout)
      uploadTimeout = setTimeout(uploadFiles, 1000)
      return
    }

    try {
      isUploading = true
      console.log(chalk.yellow('\n📤 检测到文件变化，开始热更新...'))

      const files = getDistFiles()
      if (Object.keys(files).length === 0) {
        console.log(chalk.yellow('⚠️  没有找到构建文件'))
        return
      }

      await uploader.uploadCustomization(config.appId, files)
      
      console.log(chalk.green('✅ 热更新完成！'))
      console.log(chalk.cyan('🌐 访问链接:'))
      console.log(`   桌面端: https://${config.domain}/k/${config.appId}/`)
      console.log(`   移动端: https://${config.domain}/k/m/${config.appId}/`)
      console.log(chalk.blue('\n👀 继续监听文件变化...\n'))

    } catch (error) {
      console.error(chalk.red('❌ 热更新失败:'), error.message)
    } finally {
      isUploading = false
    }
  }

  // 初始上传（等待 Vite 构建完成）
  const performInitialUpload = () => {
    if (!initialUploadDone) {
      setTimeout(async () => {
        console.log(chalk.blue('\n🚀 执行初始上传...'))
        await uploadFiles()
        initialUploadDone = true
      }, 2000) // 等待 2 秒确保构建完成
    }
  }

  // 设置文件变化监听
  watcher.on('change', () => {
    if (initialUploadDone) {
      // 延迟上传，避免频繁触发
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
    process.stdout.write(data)
    
    // 检测构建完成信号
    if (output.includes('built in') && !initialUploadDone) {
      clearTimeout(viteOutputTimer)
      viteOutputTimer = setTimeout(performInitialUpload, 1000)
    }
  })

  // 显示成功信息
  setTimeout(() => {
    console.log(chalk.green('✅'), '开发环境已启动！')
    console.log(chalk.blue('💡'), 'Kintone 热更新开发模式特点：')
    console.log(chalk.yellow('   ⚡ 修改源代码后自动构建并上传到 Kintone'))
    console.log(chalk.yellow('   🔄 每次保存文件都会触发热更新'))
    console.log(chalk.yellow('   🚀 比手动上传快 5-10 倍'))
    console.log()
    console.log(chalk.gray('   按 Ctrl+C 停止开发服务器'))
    console.log()
  }, 2000)

  // 处理进程退出
  const cleanup = async () => {
    console.log()
    console.log(chalk.yellow('🔄'), '正在停止开发服务器...')
    
    // 关闭监听器
    watcher.close()
    
    // 终止 vite 进程
    if (viteProcess && !viteProcess.killed) {
      viteProcess.kill('SIGTERM')
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

startDevServer().catch(console.error) 