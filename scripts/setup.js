#!/usr/bin/env node

import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { createInterface } from 'readline'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  console.log(chalk.cyan('🛠️  Kintone 开发工具配置向导\n'))
  
  const envFile = path.resolve('.env')
  const envExampleFile = path.resolve('env.example')
  
  // 检查是否已存在配置
  if (fs.existsSync(envFile)) {
    const overwrite = await question(chalk.yellow('⚠️  已存在 .env 文件，是否覆盖？(y/N): '))
    if (overwrite.toLowerCase() !== 'y') {
      console.log(chalk.blue('ℹ️  配置已取消'))
      rl.close()
      return
    }
  }

  console.log(chalk.blue('📝 请输入以下配置信息:\n'))

  // 生产环境配置
  console.log(chalk.cyan('🏭 生产环境配置:'))
  
  const prodDomain = await question('Kintone 域名 (例如: your-domain.cybozu.com): ')
  if (!prodDomain) {
    console.log(chalk.red('❌ 域名不能为空'))
    rl.close()
    return
  }

  const authMethod = await question('认证方式 (1: API Token, 2: 用户名密码) [1]: ')
  
  let prodApiToken = ''
  let prodUsername = ''
  let prodPassword = ''
  
  if (authMethod === '2') {
    prodUsername = await question('用户名: ')
    prodPassword = await question('密码: ')
  } else {
    prodApiToken = await question('API Token: ')
  }

  const prodAppId = await question('应用 ID: ')
  if (!prodAppId) {
    console.log(chalk.red('❌ 应用 ID 不能为空'))
    rl.close()
    return
  }

  // 开发环境配置
  console.log(chalk.cyan('\n🧪 开发环境配置:'))
  const useSameForDev = await question('是否使用相同的配置？(Y/n): ')
  
  let devDomain = prodDomain
  let devApiToken = prodApiToken
  let devUsername = prodUsername
  let devPassword = prodPassword
  let devAppId = prodAppId
  
  if (useSameForDev.toLowerCase() === 'n') {
    devDomain = await question(`开发环境域名 [${prodDomain}]: `) || prodDomain
    
    if (authMethod === '2') {
      devUsername = await question(`开发环境用户名 [${prodUsername}]: `) || prodUsername
      devPassword = await question(`开发环境密码 [${prodPassword}]: `) || prodPassword
    } else {
      devApiToken = await question(`开发环境 API Token [${prodApiToken}]: `) || prodApiToken
    }
    
    devAppId = await question(`开发环境应用 ID [${prodAppId}]: `) || prodAppId
  }

  // 其他配置
  const debug = await question('是否启用调试模式？(y/N): ')
  const devPort = await question('开发服务器端口 [3000]: ') || '3000'

  // 生成配置内容
  let envContent = `# Kintone 自定义开发工具配置
# 生成时间: ${new Date().toLocaleString()}

# === 生产环境配置 ===
KINTONE_DOMAIN=${prodDomain}
KINTONE_APP_ID=${prodAppId}
`

  if (authMethod === '2') {
    envContent += `KINTONE_USERNAME=${prodUsername}
KINTONE_PASSWORD=${prodPassword}
`
  } else {
    envContent += `KINTONE_API_TOKEN=${prodApiToken}
`
  }

  envContent += `
# === 开发环境配置 ===
DEV_KINTONE_DOMAIN=${devDomain}
DEV_KINTONE_APP_ID=${devAppId}
`

  if (authMethod === '2') {
    envContent += `DEV_KINTONE_USERNAME=${devUsername}
DEV_KINTONE_PASSWORD=${devPassword}
`
  } else {
    envContent += `DEV_KINTONE_API_TOKEN=${devApiToken}
`
  }

  envContent += `
# === 其他配置 ===
DEBUG=${debug.toLowerCase() === 'y' ? 'true' : 'false'}
DEV_PORT=${devPort}
`

  // 写入配置文件
  await fs.writeFile(envFile, envContent, 'utf8')
  
  console.log(chalk.green('\n✅ 配置文件已创建！'))
  console.log(chalk.gray(`   文件位置: ${envFile}`))
  
  console.log(chalk.blue('\n🚀 接下来你可以:'))
  console.log(chalk.gray('   pnpm run dev:upload    # 启动开发环境热更新'))
  console.log(chalk.gray('   pnpm run build:upload  # 构建并部署到生产环境'))
  
  console.log(chalk.yellow('\n💡 提示:'))
  console.log(chalk.gray('   - 确保 API Token 或用户账号有应用自定义权限'))
  console.log(chalk.gray('   - 开发环境建议使用独立的应用进行测试'))
  console.log(chalk.gray('   - 可以随时编辑 .env 文件修改配置'))

  rl.close()
}

main().catch(error => {
  console.error(chalk.red('❌ 配置失败:'), error.message)
  rl.close()
  process.exit(1)
}) 