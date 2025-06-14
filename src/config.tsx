// React 18+ 自动导入 JSX
import { createRoot } from 'react-dom/client'
import App from './components/App'

// 应用配置页面
kintone.events.on('app.record.detail.process.proceed', (event) => {
  console.log('配置页面自定义开发已加载', event)
  
  // 创建配置 UI 容器
  const container = document.createElement('div')
  container.id = 'kintone-custom-config'
  
  // 在页面中找到合适的位置
  const targetElement = document.querySelector('.contents-gaia') || document.body
  if (targetElement) {
    targetElement.appendChild(container)
    
    // 渲染配置应用
    const root = createRoot(container)
    root.render(<App mode="config" event={event} />)
  }
  
  return event
})

// 如果有独立的配置页面，也可以直接在页面加载时渲染
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否是配置页面（通过 URL 或其他标识）
  if (window.location.href.includes('config') || window.location.href.includes('setting')) {
    const container = document.createElement('div')
    container.id = 'kintone-custom-config-standalone'
    document.body.appendChild(container)
    
    const root = createRoot(container)
    root.render(<App mode="config" />)
  }
}) 