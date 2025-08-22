<template>
  <view class="minimal-tabbar">
    <view class="tabbar-container">

      <!-- 左侧毛玻璃渐变过渡 -->
      <view class="glass-fade-left"></view>
      <!-- 右侧毛玻璃渐变过渡 -->
      <view class="glass-fade-right"></view>
      
      <view class="tab-items">
        <view 
          v-for="(item, index) in tabs" 
          :key="index"
          class="tab-item"
          :class="{ 'tab-active': current === index }"
          @tap="switchTab(index)"
        >
          <view class="tab-icon">
            <text class="icon-symbol">{{ item.icon }}</text>
          </view>
          <text class="tab-text">{{ item.text }}</text>
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
      this.current = index // 立即更新当前选中状态
      const target = this.tabs[index].pagePath
      
      uni.redirectTo({
        url: target,
        complete: () => {
          this.navigating = false
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
    this.updateCurrent()
  }
}
</script>

<style scoped>
/* 极简导航栏样式 */
.minimal-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.tabbar-container {
  /* 液态毛玻璃透明背景 */
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(25rpx) saturate(180%);
  -webkit-backdrop-filter: blur(25rpx) saturate(180%);
  
  /* 更圆润的圆角设计 */
  border-radius: 50rpx 50rpx 0 0;
  
  /* 只保留顶部边框 */
  border-top: 1rpx solid rgba(0, 0, 0, 0.12);
  
  position: relative;
  margin: 0 15rpx;
  
  padding: 20rpx 0 calc(15rpx + env(safe-area-inset-bottom));
  
  /* 阴影效果 */
  box-shadow: 
    0 -12rpx 40rpx rgba(0, 0, 0, 0.08),
    0 -4rpx 16rpx rgba(0, 0, 0, 0.04),
    0 -1rpx 4rpx rgba(0, 0, 0, 0.02),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.4);
}

/* 顶部边框渐隐效果 */
.tabbar-container::before {
  content: '';
  position: absolute;
  top: -1rpx;
  left: 20rpx;
  right: 20rpx;
  height: 1rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.12) 25%,
    rgba(0, 0, 0, 0.12) 75%,
    transparent 100%
  );
  border-radius: 1rpx;
  pointer-events: none;
}

/* 左侧毛玻璃渐变过渡 */
.glass-fade-left {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -25rpx;
  width: 25rpx;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 40%,
    rgba(255, 255, 255, 0.7) 80%,
    rgba(255, 255, 255, 0.9) 100%
  );
  backdrop-filter: blur(15rpx) saturate(150%);
  -webkit-backdrop-filter: blur(15rpx) saturate(150%);
  border-radius: 50rpx 0 0 0;
  pointer-events: none;
}

/* 右侧毛玻璃渐变过渡 */
.glass-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  right: -25rpx;
  width: 25rpx;
  background: linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 40%,
    rgba(255, 255, 255, 0.7) 80%,
    rgba(255, 255, 255, 0.9) 100%
  );
  backdrop-filter: blur(15rpx) saturate(150%);
  -webkit-backdrop-filter: blur(15rpx) saturate(150%);
  border-radius: 0 50rpx 0 0;
  pointer-events: none;
}







.tab-items {
  display: flex;
  align-items: center;
  justify-content: space-around;
  max-width: 750rpx;
  margin: 0 auto;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 20rpx 8rpx 20rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-symbol {
  font-size: 36rpx;
  line-height: 1;
  color: #999999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  /* 强制灰色显示，避免 emoji 彩色 */
  -webkit-text-fill-color: #999999;
  text-rendering: optimizeLegibility;
  font-variant-emoji: text;
}

.tab-text {
  font-size: 22rpx;
  color: #999999;
  font-weight: 400;
  line-height: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 选中状态 */
.tab-active .icon-symbol {
  color: #000000;
  font-size: 42rpx;
  transform: scale(1.1);
  /* 强制黑色显示，避免 emoji 彩色 */
  -webkit-text-fill-color: #000000;
}

.tab-active .tab-text {
  color: #000000;
  font-weight: 500;
  font-size: 24rpx;
}

/* 移除图标切换动画，避免抖动 */

/* 悬停效果 */
.tab-item:active {
  transform: scale(0.95);
}

.tab-item:active .icon-symbol {
  transform: scale(0.9);
}

/* 移除悬浮动画，避免影响图标稳定性 */
</style>
