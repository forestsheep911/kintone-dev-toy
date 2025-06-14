import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import mkcert from 'vite-plugin-mkcert'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build'
  const isDev = !isProduction
  
  return {
    plugins: [
      react(),
      // 开发模式下启用 HTTPS
      isDev && mkcert(),
      // 自定义插件：根据查询参数路由到不同入口文件
      isDev && {
        name: 'kintone-dev-router',
        configureServer(server) {
          // 根路径路由处理
          server.middlewares.use('/', async (req, res, next) => {
            const url = new URL(req.url, `http://${req.headers.host}`)
            const type = url.searchParams.get('type')
            
            if (!type) {
              next()
              return
            }
            
            // 设置正确的响应头
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control')
            
            let targetFile = ''
            switch (type) {
              case 'desktop':
                targetFile = '/src/desktop.tsx'
                break
              case 'mobile':
                targetFile = '/src/mobile.tsx'
                break
              case 'config':
                targetFile = '/src/config.tsx'
                break
              default:
                res.statusCode = 404
                res.end('Not found')
                return
            }
            
            try {
              // 使用 Vite 的内部转换来处理文件
              const result = await server.transformRequest(targetFile)
              if (result) {
                res.end(result.code)
              } else {
                res.statusCode = 500
                res.end('Transform failed')
              }
            } catch (error) {
              console.error('Transform error:', error)
              res.statusCode = 500
              res.end(`Transform error: ${error.message}`)
            }
          })
        }
      }
    ].filter(Boolean),
    
    // CSS 处理配置
    css: {
      // 确保 CSS 被内联到 JS 中
      modules: false,
      postcss: {},
    },
    
    // 开发服务器配置
    server: {
      port: 5173,
      host: '0.0.0.0', // 允许外部访问
      ...(isDev && { https: {} }), // 开发模式下启用 HTTPS
      cors: true, // 允许 kintone 跨域访问
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control'
      }
    },

    // 构建配置
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          desktop: resolve(__dirname, 'src/desktop.tsx'),
          mobile: resolve(__dirname, 'src/mobile.tsx'),
          config: resolve(__dirname, 'src/config.tsx')
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
          // 强制内联所有资源
          inlineDynamicImports: false,
          manualChunks: undefined,
          // 输出格式为 IIFE，可以直接在浏览器中执行
          format: 'iife',
          // 不使用严格模式，避免模块相关问题
          strict: false
        },
        external: [],
      },
      // 内联所有资源
      assetsInlineLimit: 10 * 1024 * 1024,
      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    
    // 开发模式下的特殊配置
    define: {
      __DEV_MODE__: !isProduction
    },
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
}) 