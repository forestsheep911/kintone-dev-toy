import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'

// 加载环境变量
dotenv.config()

export function getConfig(env = 'production') {
  const isDev = env === 'development'
  
  // 获取对应环境的配置
  const domain = isDev ? 
    (process.env.DEV_KINTONE_DOMAIN || process.env.KINTONE_DOMAIN) : 
    process.env.KINTONE_DOMAIN
  
  const apiToken = isDev ? 
    (process.env.DEV_KINTONE_API_TOKEN || process.env.KINTONE_API_TOKEN) : 
    process.env.KINTONE_API_TOKEN
  
  const username = isDev ? 
    (process.env.DEV_KINTONE_USERNAME || process.env.KINTONE_USERNAME) : 
    process.env.KINTONE_USERNAME
  
  const password = isDev ? 
    (process.env.DEV_KINTONE_PASSWORD || process.env.KINTONE_PASSWORD) : 
    process.env.KINTONE_PASSWORD
  
  const appId = isDev ? 
    (process.env.DEV_KINTONE_APP_ID || process.env.KINTONE_APP_ID) : 
    process.env.KINTONE_APP_ID

  // 验证必需的配置
  if (!domain) {
    throw new Error(`${isDev ? 'DEV_' : ''}KINTONE_DOMAIN 环境变量未设置`)
  }

  // 优先使用用户名密码，如果都设置了，忽略API Token
  let useUsername = false
  if (username && password) {
    useUsername = true
    console.log(chalk.blue('ℹ️  使用用户名密码认证（推荐用于上传代码）'))
  } else if (apiToken) {
    console.log(chalk.yellow('⚠️  使用API Token认证（权限可能不足）'))
  } else {
    throw new Error(`需要设置 ${isDev ? 'DEV_' : ''}KINTONE_USERNAME + ${isDev ? 'DEV_' : ''}KINTONE_PASSWORD 或者 ${isDev ? 'DEV_' : ''}KINTONE_API_TOKEN`)
  }

  if (!appId) {
    throw new Error(`${isDev ? 'DEV_' : ''}KINTONE_APP_ID 环境变量未设置`)
  }

  return {
    domain,
    apiToken: useUsername ? null : apiToken, // 如果使用用户名密码，强制清空apiToken
    username: useUsername ? username : null,
    password: useUsername ? password : null,
    appId: parseInt(appId),
    debug: process.env.DEBUG === 'true',
    env
  }
}

export async function loadConfig(env = 'development') {
  try {
    // 验证环境文件是否存在
    if (!validateEnvironment()) {
      return null
    }
    
    return getConfig(env)
  } catch (error) {
    console.error(chalk.red('❌'), '配置加载失败:', error.message)
    return null
  }
}

export function getDistFiles() {
  const distDir = path.resolve('./dist')
  
  const files = {}
  
  // 检查桌面端文件
  const desktopFile = path.join(distDir, 'desktop.js')
  if (fs.existsSync(desktopFile)) {
    files.desktop = desktopFile
  }
  
  // 检查移动端文件
  const mobileFile = path.join(distDir, 'mobile.js')
  if (fs.existsSync(mobileFile)) {
    files.mobile = mobileFile
  }
  
  // 检查CSS文件
  const cssFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.css'))
  if (cssFiles.length > 0) {
    files.css = path.join(distDir, cssFiles[0])
  }
  
  return files
}

export function validateEnvironment() {
  const envFile = path.resolve('.env')
  const envExampleFile = path.resolve('env.example')
  
  if (!fs.existsSync(envFile)) {
    console.log(chalk.yellow('⚠️  未找到 .env 文件'))
    
    if (fs.existsSync(envExampleFile)) {
      console.log(chalk.blue('💡 请复制 env.example 为 .env 并填入真实配置：'))
      console.log(chalk.gray('   cp env.example .env'))
    }
    
    return false
  }
  
  return true
}

export function printConfig(config) {
  console.log(chalk.cyan('\n📋 当前配置:'))
  console.log(chalk.gray('   环境:'), config.env)
  console.log(chalk.gray('   域名:'), config.domain)
  console.log(chalk.gray('   应用ID:'), config.appId)
  console.log(chalk.gray('   认证方式:'), config.apiToken ? 'API Token' : '用户名密码')
  console.log(chalk.gray('   调试模式:'), config.debug ? '开启' : '关闭')
  
  // 如果是用户名密码认证，显示认证信息（不显示完整密码）
  if (config.username && config.password) {
    console.log(chalk.gray('   用户名:'), config.username)
    console.log(chalk.gray('   密码:'), config.password ? '***' + config.password.slice(-2) : 'null')
  }
  console.log('')
} 