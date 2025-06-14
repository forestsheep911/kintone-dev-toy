// Kintone 桌面端自定义开发入口文件
import { createRoot } from 'react-dom/client'
import App from './components/App'

// 内联 CSS 样式
const appCSS = `
  .kintone-custom-app {
    font-family: 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
    background: #fff;
    border: 1px solid #e3e7e8;
    border-radius: 6px;
    margin: 20px 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e3e7e8;
    background: #f7f9fa;
  }
  
  .app-header h2 {
    margin: 0;
    color: #3498db;
    font-size: 18px;
    font-weight: 600;
  }
  
  .mode-badge {
    background: #3498db;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  .app-content {
    padding: 20px;
  }
  
  .desktop-view h3 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
  }
  
  .feature-section {
    display: flex;
    gap: 12px;
    margin-top: 20px;
  }
  
  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .btn.primary {
    background: #3498db;
    color: white;
  }
  
  .btn.primary:hover {
    background: #2980b9;
  }
  
  .btn.secondary {
    background: #95a5a6;
    color: white;
  }
  
  .btn.secondary:hover {
    background: #7f8c8d;
  }
  
  .dev-info {
    margin-top: 20px;
    padding: 16px;
    background: #2c3e50;
    color: #ecf0f1;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
  
  .dev-info details {
    cursor: pointer;
  }
  
  .dev-info summary {
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .dev-info pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 12px;
    line-height: 1.4;
    max-height: 200px;
    overflow-y: auto;
  }
`;

// 动态加载 CSS
const loadCSS = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

// 应用初始化函数
const initializeApp = (event: kintone.events.EventObject) => {
  console.log('🚀 Kintone Desktop 应用初始化中...', event);
  
  // 加载 CSS
  loadCSS(appCSS);
  
  // 创建容器元素
  const container = document.createElement('div');
  container.id = 'kintone-custom-app-desktop';
  container.style.cssText = `
    margin: 20px 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
  `;
  
  try {
    // 使用 kintone 官方 API 获取菜单下方的空白区域
    const headerSpaceElement = kintone.app.getHeaderSpaceElement();
    if (headerSpaceElement) {
      console.log('✅ 找到 headerSpaceElement，正在渲染应用...');
      headerSpaceElement.appendChild(container);
      
      // 渲染 React 应用
      const root = createRoot(container);
      root.render(<App mode="desktop" event={event} />);
      
      console.log('✅ React 应用渲染完成');
    } else {
      console.error('❌ 无法获取 headerSpaceElement');
      // 备用方案：直接添加到页面顶部
      const fallbackContainer = document.querySelector('.contents-body') || document.body;
      fallbackContainer.insertBefore(container, fallbackContainer.firstChild);
      
      const root = createRoot(container);
      root.render(<App mode="desktop" event={event} />);
      
      console.log('⚠️ 使用备用方案渲染应用');
    }
  } catch (error) {
    console.error('❌ 渲染应用时出错:', error);
    
    // 最后的备用方案
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<App mode="desktop" event={event} />);
    
    console.log('⚠️ 使用最后备用方案渲染应用');
  }
};

// 监听 kintone 应用显示事件
if (typeof kintone !== 'undefined') {
  console.log('🔗 注册 Kintone 事件监听器...');
  
  // 列表页面显示事件（主要功能）
  kintone.events.on('app.record.index.show', (event) => {
    console.log('📋 列表页面显示事件触发');
    initializeApp(event);
    return event;
  });
  
  console.log('✅ 列表页面事件监听器已注册');
} else {
  console.error('❌ kintone 对象未找到，可能不在 kintone 环境中');
  
  // 开发环境下的测试
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔧 开发环境：直接渲染应用');
    setTimeout(() => {
      initializeApp({ 
        type: 'development',
        appId: 80,
        viewType: 'list'
      } as kintone.events.EventObject);
    }, 1000);
  }
}

console.log('✅ Kintone Desktop 自定义代码加载完成'); 