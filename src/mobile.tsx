// React 18+ 自动导入 JSX
import { createRoot } from 'react-dom/client'
import App from './components/App'

// 移动端应用初始化
const initializeMobileApp = (event: any) => {
  console.log('📱 Kintone Mobile 应用初始化中...', event)
  
  // 创建容器元素
  const container = document.createElement('div')
  container.id = 'kintone-custom-app-mobile'
  container.style.cssText = `
    margin: 10px 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
  `

  try {
    // 移动端通常直接添加到页面内容区域
    const contentArea = document.querySelector('.contents-body') || 
                       document.querySelector('.recordlist-gaia') ||
                       document.querySelector('.record-gaia') ||
                       document.body
    
    if (contentArea) {
      console.log('✅ 找到内容区域，正在渲染移动端应用...')
      contentArea.insertBefore(container, contentArea.firstChild)
      
      // 渲染 React 应用
      const root = createRoot(container)
      root.render(<App mode="mobile" event={event} />)
      
      console.log('✅ 移动端 React 应用渲染完成')
    } else {
      console.error('❌ 无法找到合适的容器')
      // 备用方案
      document.body.appendChild(container)
      const root = createRoot(container)
      root.render(<App mode="mobile" event={event} />)
      
      console.log('⚠️ 使用备用方案渲染移动端应用')
    }
  } catch (error) {
    console.error('❌ 渲染移动端应用时出错:', error)
    
    // 最后的备用方案
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(<App mode="mobile" event={event} />)
    
    console.log('⚠️ 使用最后备用方案渲染移动端应用')
  }
}

// 监听 kintone 移动端事件
if (typeof kintone !== 'undefined') {
  console.log('🔗 注册 Kintone 移动端事件监听器...')
  
  // 移动端详情页面显示事件
  kintone.events.on('mobile.app.record.detail.show', (event) => {
    console.log('📱📄 移动端详情页面显示事件触发')
    initializeMobileApp(event)
    return event
  })
  
  // 移动端编辑页面显示事件
  kintone.events.on('mobile.app.record.edit.show', (event) => {
    console.log('📱✏️ 移动端编辑页面显示事件触发')
    initializeMobileApp(event)
    return event
  })
  
  // 移动端创建页面显示事件
  kintone.events.on('mobile.app.record.create.show', (event) => {
    console.log('📱➕ 移动端创建页面显示事件触发')
    initializeMobileApp(event)
    return event
  })
  
  // 移动端列表页面显示事件
  kintone.events.on('mobile.app.record.index.show', (event) => {
    console.log('📱📋 移动端列表页面显示事件触发')
    initializeMobileApp(event)
    return event
  })
  
  console.log('✅ 所有移动端事件监听器已注册')
} else {
  console.error('❌ kintone 对象未找到，可能不在 kintone 环境中')
  
  // 开发环境下的测试
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 开发环境：直接渲染移动端应用')
    setTimeout(() => {
      initializeMobileApp({ type: 'development-mobile' })
    }, 1000)
  }
} 