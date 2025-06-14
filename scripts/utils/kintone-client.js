import { KintoneRestAPIClient } from '@kintone/rest-api-client'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'

export class KintoneUploader {
  constructor(config) {
    this.config = config
    this.debug = config.debug || false
    
    // 创建 REST API 客户端 - 优先使用用户名密码
    this.client = new KintoneRestAPIClient({
      baseUrl: `https://${config.domain}`,
      auth: config.username && config.password ? {
        username: config.username,
        password: config.password
      } : {
        apiToken: config.apiToken
      }
    })
    
    this.log('Kintone 客户端已初始化', config.domain)
  }

  log(message, ...args) {
    if (this.debug) {
      console.log(chalk.blue('[DEBUG]'), message, ...args)
    } else {
      console.log(chalk.green('✅'), message, ...args)
    }
  }

  error(message, ...args) {
    console.error(chalk.red('❌'), message, ...args)
  }

  warn(message, ...args) {
    console.warn(chalk.yellow('⚠️'), message, ...args)
  }

  /**
   * 上传文件到 kintone 应用
   */
  async uploadCustomization(appId, files) {
    try {
      this.log(`开始上传自定义文件到应用 ${appId}`)
      
      // 准备上传的文件
      const uploadFiles = {}
      
      for (const [type, filePath] of Object.entries(files)) {
        if (fs.existsSync(filePath)) {
          const fileKey = await this.uploadFile(filePath)
          uploadFiles[type] = {
            type: 'FILE',
            file: {
              fileKey: fileKey
            }
          }
          this.log(`文件 ${type} 已准备: ${path.basename(filePath)} (fileKey: ${fileKey})`)
        } else {
          this.warn(`文件不存在: ${filePath}`)
        }
      }

      // 按照官方文档格式构建请求参数
      const requestParams = {
        app: appId,
        scope: 'ALL', // 对所有用户生效
        desktop: {
          js: uploadFiles.desktop ? [uploadFiles.desktop] : [],
          css: uploadFiles.css ? [uploadFiles.css] : []
        },
        mobile: {
          js: uploadFiles.mobile ? [uploadFiles.mobile] : [],
          css: []
        }
      }

      this.log('请求参数:', JSON.stringify(requestParams, null, 2))

      // 构建请求头 - 使用正确的 X-Cybozu-Authorization
      const headers = {
        'Content-Type': 'application/json',
        'X-Cybozu-Authorization': Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')
      }

      this.log('请求头信息:')
      this.log(`  URL: https://${this.config.domain}/k/v1/preview/app/customize.json`)
      this.log(`  用户名: ${this.config.username}`)
      this.log(`  密码: ${this.config.password ? '***' + this.config.password.slice(-2) : 'null'}`)
      this.log(`  X-Cybozu-Authorization: ${headers['X-Cybozu-Authorization']}`)
      this.log(`  Headers:`, JSON.stringify(headers, null, 2))

      // 使用直接的 axios 请求，确保使用正确的预览 API 端点
      const response = await axios.put(
        `https://${this.config.domain}/k/v1/preview/app/customize.json`,
        requestParams,
        {
          headers: headers
        }
      )
      
      this.log('自定义文件上传成功！', response.data)
      
      // 部署应用更新
      await this.deployApp(appId)
      
      return response.data
    } catch (error) {
      this.error('上传失败:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * 上传单个文件并获取 fileKey
   */
  async uploadFile(filePath) {
    try {
      const fileName = path.basename(filePath)
      const fileContent = await fs.readFile(filePath)
      
      const formData = new FormData()
      formData.append('file', fileContent, fileName)
      
      // 构建正确的认证头
      const headers = {
        ...formData.getHeaders(),
        ...(this.config.username && this.config.password ? {
          'X-Cybozu-Authorization': Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')
        } : {
          'X-Cybozu-API-Token': this.config.apiToken
        })
      }

      this.log(`上传文件: ${fileName}`)
      this.log(`认证头: ${this.config.username ? 'X-Cybozu-Authorization' : 'X-Cybozu-API-Token'}`)
      
      const response = await axios.post(
        `https://${this.config.domain}/k/v1/file.json`,
        formData,
        { headers }
      )

      this.log(`文件上传成功，fileKey: ${response.data.fileKey}`)
      return response.data.fileKey
    } catch (error) {
      this.error(`文件上传失败 ${filePath}:`, error.response?.data || error.message)
      throw error
    }
  }

  /**
   * 部署应用更新
   */
  async deployApp(appId) {
    try {
      this.log(`部署应用 ${appId} 的更新...`)
      
      const result = await this.client.app.deployApp({
        apps: [{ app: appId }]
      })
      
      this.log('应用部署成功！')
      return result
    } catch (error) {
      this.error('应用部署失败:', error.message)
      throw error
    }
  }

  /**
   * 获取应用信息
   */
  async getAppInfo(appId) {
    try {
      const result = await this.client.app.getApp({ id: appId })
      return result
    } catch (error) {
      this.error('获取应用信息失败:', error.message)
      throw error
    }
  }

  /**
   * 测试连接
   */
  async testConnection() {
    try {
      // 尝试获取应用列表来测试连接
      const apps = await this.client.app.getApps({ limit: 1 })
      this.log('连接测试成功')
      return true
    } catch (error) {
      this.error('连接测试失败:', error.message)
      return false
    }
  }

  /**
   * 设置开发模式 - 配置应用使用本地开发服务器的 URL
   */
  async setupDevMode(appId, urls) {
    try {
      this.log(`配置应用 ${appId} 使用开发服务器...`)
      
      // 构建开发模式的自定义设置
      const requestParams = {
        app: appId,
        scope: 'ALL',
        desktop: {
          js: urls.desktop ? [{
            type: 'URL',
            url: urls.desktop
          }] : [],
          css: urls.css ? [{
            type: 'URL',
            url: urls.css
          }] : []
        },
        mobile: {
          js: urls.mobile ? [{
            type: 'URL',
            url: urls.mobile
          }] : [],
          css: []
        }
      }

      this.log('开发模式配置参数:', JSON.stringify(requestParams, null, 2))

      // 使用官方客户端更新自定义设置
      const result = await this.client.app.updateAppCustomize(requestParams)
      
      this.log('开发模式配置成功！')
      
      // 部署应用更新
      await this.deployApp(appId)
      
      return result
    } catch (error) {
      this.error('开发模式配置失败:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * 清除自定义设置（恢复到生产环境状态）
   */
  async clearCustomization(appId) {
    try {
      this.log(`清除应用 ${appId} 的自定义设置...`)
      
      const requestParams = {
        app: appId,
        scope: 'ALL',
        desktop: {
          js: [],
          css: []
        },
        mobile: {
          js: [],
          css: []
        }
      }

      // 使用官方客户端清除自定义设置
      const result = await this.client.app.updateAppCustomize(requestParams)
      
      // 部署应用更新
      await this.deployApp(appId)
      
      this.log('自定义设置已清除')
      return result
    } catch (error) {
      this.error('清除自定义设置失败:', error.response?.data || error.message)
      throw error
    }
  }
}