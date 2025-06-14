import React from 'react'
import './App.css'

interface AppProps {
  mode: 'desktop' | 'mobile' | 'list' | 'config'
  event?: any
}

const App: React.FC<AppProps> = ({ mode, event }) => {
  return (
    <div className="kintone-custom-app">
      <div className="app-header">
        <h2>Kintone 自定义开发工具</h2>
        <span className="mode-badge">{mode}</span>
      </div>
      
      <div className="app-content">
        {mode === 'desktop' && (
          <div className="desktop-view">
            <h3>桌面端视图</h3>
            <p>这里是桌面端的自定义功能</p>
            <div className="feature-section">
              <button className="btn primary">主要功能</button>
              <button className="btn secondary">辅助功能</button>
            </div>
          </div>
        )}
        
        {mode === 'mobile' && (
          <div className="mobile-view">
            <h3>移动端视图</h3>
            <p>这里是移动端的自定义功能</p>
            <div className="mobile-actions">
              <button className="btn-mobile">移动操作</button>
            </div>
          </div>
        )}
        
        {mode === 'list' && (
          <div className="list-view">
            <h3>列表视图</h3>
            <p>这里是列表页面的自定义功能</p>
            <div className="list-tools">
              <button className="btn primary">批量操作</button>
              <button className="btn secondary">导出数据</button>
            </div>
          </div>
        )}
        
        {mode === 'config' && (
          <div className="config-view">
            <h3>设置页面</h3>
            <p>这里是应用的配置页面</p>
            <form className="config-form">
              <div className="form-group">
                <label>设置项 1:</label>
                <input type="text" placeholder="输入配置值" />
              </div>
              <div className="form-group">
                <label>设置项 2:</label>
                <select>
                  <option value="">请选择</option>
                  <option value="option1">选项1</option>
                  <option value="option2">选项2</option>
                </select>
              </div>
              <button type="submit" className="btn primary">保存设置</button>
            </form>
          </div>
        )}
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="dev-info">
          <details>
            <summary>开发信息</summary>
            <pre>{JSON.stringify(event, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default App 