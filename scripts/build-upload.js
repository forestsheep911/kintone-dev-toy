#!/usr/bin/env node

import { spawn } from 'child_process'
import chalk from 'chalk'
import { KintoneUploader } from './utils/kintone-client.js'
import { loadConfig, getDistFiles } from './utils/config.js'

async function buildAndUpload() {
  console.log(chalk.blue('🏭'), 'Kintone 生产环境构建部署启动中...')
  console.log()

  // 加载生产环境配置
  const config = await loadConfig('production') // 明确指定生产环境
  if (!config) {
    console.error(chalk.red('❌'), '生产环境配置加载失败，请先运行 pnpm run setup')
    process.exit(1)
  }

  // 显示配置信息
  console.log(chalk.blue('ℹ️'), '使用生产环境配置')
  console.log()
  console.log(chalk.cyan('📋'), '生产环境配置:')
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
    console.error(chalk.red('❌'), '连接失败，请检查生产环境配置')
    process.exit(1)
  }

  try {
    // 执行生产构建
    console.log(chalk.green('🔨'), '开始生产环境构建...')
    await new Promise((resolve, reject) => {
      const buildProcess = spawn('npx', ['vite', 'build'], {
        stdio: 'inherit',
        shell: true
      })

      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`构建失败，退出代码: ${code}`))
        }
      })
    })

    console.log(chalk.green('✅'), '生产构建完成！')
    console.log()

    // 获取构建文件
    console.log(chalk.blue('📦'), '准备上传构建文件...')
    const files = getDistFiles()
    if (Object.keys(files).length === 0) {
      console.error(chalk.red('❌'), '没有找到构建文件')
      process.exit(1)
    }

    // 上传到生产环境
    console.log(chalk.yellow('📤'), '上传到生产环境...')
    await uploader.uploadCustomization(config.appId, files)
    
    console.log(chalk.green('🎉'), '生产环境部署成功！')
    console.log(chalk.cyan('🌐'), '访问链接:')
    console.log(`   桌面端: https://${config.domain}/k/${config.appId}/`)
    console.log(`   移动端: https://${config.domain}/k/m/${config.appId}/`)
    console.log()
    console.log(chalk.blue('💡'), '生产环境特点：')
    console.log(chalk.gray('   ✅ 使用生产环境配置文件'))
    console.log(chalk.gray('   ✅ 代码已优化和压缩'))
    console.log(chalk.gray('   ✅ 所有资源打包为最小文件'))

  } catch (error) {
    console.error(chalk.red('❌'), '构建或部署失败:', error.message)
    process.exit(1)
  }
}

buildAndUpload().catch(console.error) 