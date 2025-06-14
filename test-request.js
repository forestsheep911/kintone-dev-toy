#!/usr/bin/env node

import dotenv from 'dotenv'
import axios from 'axios'
import chalk from 'chalk'

// 加载环境变量
dotenv.config()

const domain = process.env.KINTONE_DOMAIN
const username = process.env.KINTONE_USERNAME
const password = process.env.KINTONE_PASSWORD
const appId = process.env.KINTONE_APP_ID

console.log(chalk.cyan('🧪 HTTP 请求测试\n'))

// 构建请求头
const auth = Buffer.from(`${username}:${password}`).toString('base64')
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${auth}`,
  'User-Agent': 'kintone-dev-tool/1.0.0'
}

console.log(chalk.blue('请求信息:'))
console.log(`  URL: https://${domain}/k/v1/preview/app/customize.json`)
console.log(`  用户名: ${username}`)
console.log(`  密码: ${password ? '***' + password.slice(-2) : 'null'}`)
console.log(`  Authorization: Basic ${auth}`)
console.log(`  Headers:`, JSON.stringify(headers, null, 2))

// 测试简单的 GET 请求先
console.log(chalk.yellow('\n1. 测试基本连接 (GET /k/v1/apps)...'))

try {
  const response = await axios.get(`https://${domain}/k/v1/apps.json?limit=1`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'User-Agent': 'kintone-dev-tool/1.0.0'
    }
  })
  console.log(chalk.green('✅ 基本连接成功'))
  console.log('响应状态:', response.status)
} catch (error) {
  console.log(chalk.red('❌ 基本连接失败'))
  console.log('错误状态:', error.response?.status)
  console.log('错误信息:', error.response?.data)
}

// 测试获取应用信息
console.log(chalk.yellow(`\n2. 测试获取应用信息 (GET /k/v1/app?id=${appId})...`))

try {
  const response = await axios.get(`https://${domain}/k/v1/app.json?id=${appId}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'User-Agent': 'kintone-dev-tool/1.0.0'
    }
  })
  console.log(chalk.green('✅ 获取应用信息成功'))
  console.log('应用名称:', response.data.name)
} catch (error) {
  console.log(chalk.red('❌ 获取应用信息失败'))
  console.log('错误状态:', error.response?.status)
  console.log('错误信息:', error.response?.data)
}

// 测试获取当前自定义设置
console.log(chalk.yellow(`\n3. 测试获取自定义设置 (GET /k/v1/preview/app/customize?app=${appId})...`))

try {
  const response = await axios.get(`https://${domain}/k/v1/preview/app/customize.json?app=${appId}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'User-Agent': 'kintone-dev-tool/1.0.0'
    }
  })
  console.log(chalk.green('✅ 获取自定义设置成功'))
  console.log('当前设置:', JSON.stringify(response.data, null, 2))
} catch (error) {
  console.log(chalk.red('❌ 获取自定义设置失败'))
  console.log('错误状态:', error.response?.status)
  console.log('错误信息:', error.response?.data)
}

console.log(chalk.cyan('\n测试完成!')) 