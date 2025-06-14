#!/usr/bin/env node

import dotenv from 'dotenv'
import chalk from 'chalk'

// 加载环境变量
dotenv.config()

console.log(chalk.cyan('🔍 认证信息检查\n'))

console.log(chalk.blue('环境变量:'))
console.log('  KINTONE_DOMAIN:', process.env.KINTONE_DOMAIN)
console.log('  KINTONE_USERNAME:', process.env.KINTONE_USERNAME)
console.log('  KINTONE_PASSWORD:', process.env.KINTONE_PASSWORD ? '***' + process.env.KINTONE_PASSWORD.slice(-2) : 'null')
console.log('  KINTONE_API_TOKEN:', process.env.KINTONE_API_TOKEN ? '***' + process.env.KINTONE_API_TOKEN.slice(-4) : 'null')
console.log('  KINTONE_APP_ID:', process.env.KINTONE_APP_ID)

console.log('\n' + chalk.blue('开发环境变量:'))
console.log('  DEV_KINTONE_DOMAIN:', process.env.DEV_KINTONE_DOMAIN)
console.log('  DEV_KINTONE_USERNAME:', process.env.DEV_KINTONE_USERNAME)
console.log('  DEV_KINTONE_PASSWORD:', process.env.DEV_KINTONE_PASSWORD ? '***' + process.env.DEV_KINTONE_PASSWORD.slice(-2) : 'null')
console.log('  DEV_KINTONE_API_TOKEN:', process.env.DEV_KINTONE_API_TOKEN ? '***' + process.env.DEV_KINTONE_API_TOKEN.slice(-4) : 'null')
console.log('  DEV_KINTONE_APP_ID:', process.env.DEV_KINTONE_APP_ID)

// 测试 Basic Auth 编码
if (process.env.KINTONE_USERNAME && process.env.KINTONE_PASSWORD) {
  const auth = Buffer.from(`${process.env.KINTONE_USERNAME}:${process.env.KINTONE_PASSWORD}`).toString('base64')
  console.log('\n' + chalk.blue('Basic Auth 编码:'))
  console.log('  Authorization: Basic', auth)
} 