<template>
  <view class="linear-tabbar">
    <view class="tabbar-main">
      <!-- 内容区域 -->
      <view class="tab-content">
        <view 
          v-for="(item, index) in tabs" 
          :key="index"
          class="tab-item"
          :class="{ 'active': current === index }"
          @tap="switchTab(index)"
        >
          <view class="icon-wrapper">
            <text class="tab-icon">{{ item.icon }}</text>
          </view>
          <text class="tab-label">{{ item.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomTabBar',
  data() {
    return {
      current: 0, // 默认选中分类页面
      navigating: false,
      tabs: [
        { 
          pagePath: '/pages/category/index', 
          text: '分类', 
          icon: '☰'
        },
        { 
          pagePath: '/pages/showcase/index', 
          text: '展示', 
          icon: '★'
        },
        { 
          pagePath: '/pages/contact/index', 
          text: '联系', 
          icon: '☏'
        }
      ]
    }
  },
  mounted() {
    this.updateCurrent()
  },
  methods: {
    switchTab(index) {
      if (this.navigating || this.current === index) return
      
      // 添加触觉反馈
      uni.vibrateShort({
        type: 'light'
      })
      
      this.navigating = true
      const target = this.tabs[index].pagePath
      
      // 延迟更新状态，避免闪烁
      setTimeout(() => {
        this.current = index
      }, 50)
      
      uni.redirectTo({
        url: target,
        complete: () => {
          this.navigating = false
          // 确保状态正确
          this.updateCurrent()
        }
      })
    },
    
    updateCurrent() {
      const pages = getCurrentPages()
      if (pages.length) {
        const currentPage = pages[pages.length - 1]
        const route = currentPage.route
        
        // 更精确的路由匹配
        let index = -1
        if (route.includes('category')) {
          index = 0
        } else if (route.includes('showcase')) {
          index = 1
        } else if (route.includes('contact')) {
          index = 2
        }
        
        if (index !== -1) {
          this.current = index
        }
      }
    }
  },
  
  // 监听页面显示事件
  onShow() {
    // 延迟更新，避免页面切换时闪烁
    setTimeout(() => {
      this.updateCurrent()
    }, 100)
  }
}
</script>

<style scoped>
/* Linear 风格导航栏 */
.linear-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0 16rpx;
}

.tabbar-main {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 70rpx 70rpx 0 0;
  overflow: hidden;
  
  /* 清晰的灰色边框 */
  border: 1rpx solid rgba(0, 0, 0, 0.2);
  border-bottom: none;
  
  /* 精细阴影 */
  box-shadow: 
    0 -8rpx 32rpx rgba(0, 0, 0, 0.06),
    0 -2rpx 8rpx rgba(0, 0, 0, 0.04);
}

/* 主毛玻璃层 - 中心区域完整效果 */
/* 毛玻璃效果 - 单层优化 */
.tabbar-main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(12rpx) saturate(150%);
  -webkit-backdrop-filter: blur(12rpx) saturate(150%);
  border-radius: 70rpx 70rpx 0 0;
  pointer-events: none;
}

/* 边框容器 - 使用 border-image 实现完美渐变边框 */
.border-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: 60rpx 60rpx 0 0;
  border: 1rpx solid transparent;
  border-bottom: none;
  border-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    transparent 50%
  ) 1;
  z-index: 10;
}

/* 内容区域 */
.tab-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 14rpx 0 calc(12rpx + env(safe-area-inset-bottom));
  position: relative;
  z-index: 1;
}

/* 标签项 */
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx 16rpx 6rpx 16rpx;
  min-width: 80rpx;
}

/* 图标容器 */
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
}

/* 图标样式 */
.tab-icon {
  font-size: 40rpx;
  line-height: 1;
  color: #8E8E93;
  -webkit-text-fill-color: #8E8E93;
  font-variant-emoji: text;
  text-rendering: optimizeLegibility;
}

/* 标签文字 */
.tab-label {
  font-size: 20rpx;
  color: #8E8E93;
  font-weight: 400;
  line-height: 1;
  text-align: center;
}

/* 活跃状态 */
.tab-item.active .tab-icon {
  color: #000000;
  -webkit-text-fill-color: #000000;
  font-size: 46rpx;
}

.tab-item.active .tab-label {
  color: #000000;
  font-weight: 500;
  font-size: 22rpx;
}
</style>
