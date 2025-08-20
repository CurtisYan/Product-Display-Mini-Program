<template>
  <view class="tabbar">
    <view class="tabbar-bg"></view>
    <view class="tabbar-items">
      <view 
        v-for="(item, index) in tabs" 
        :key="index"
        class="tab"
        :class="{ active: current === index }"
        @tap="switchTab(index)"
      >
        <view class="tab-icon">
          <text class="emoji">{{ item.icon }}</text>
        </view>
        <text class="tab-label">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomTabBar',
  data() {
    return {
      current: 0,
      navigating: false,
      tabs: [
        { pagePath: '/pages/category/index', text: '分类', icon: '📋' },
        { pagePath: '/pages/showcase/index', text: '展示', icon: '🎨' },
        { pagePath: '/pages/contact/index', text: '联系', icon: '📞' }
      ]
    }
  },
  mounted() {
    this.updateCurrent()
  },
  methods: {
    switchTab(index) {
      if (this.navigating || this.current === index) return
      
      this.navigating = true
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
        const route = '/' + pages[pages.length - 1].route
        const index = this.tabs.findIndex(tab => tab.pagePath === route)
        if (index !== -1) this.current = index
      }
    }
  }
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 120rpx;
  padding-bottom: env(safe-area-inset-bottom);
}

.tabbar-bg {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
}

.tabbar-items {
  position: relative;
  z-index: 2;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 12rpx 0;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  transition: transform 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.tab:active {
  transform: scale(0.96);
}

.tab-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: #f8fafc;
  margin-bottom: 6rpx;
  transition: all 0.25s ease;
}

.tab.active .tab-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.3);
}

.emoji {
  font-size: 36rpx;
  transition: all 0.25s ease;
  filter: grayscale(0.4);
}

.tab.active .emoji {
  filter: grayscale(0);
  transform: scale(1.1);
}

.tab-label {
  font-size: 22rpx;
  color: #64748b;
  font-weight: 500;
  transition: all 0.25s ease;
}

.tab.active .tab-label {
  color: #667eea;
  font-weight: 600;
  transform: scale(1.05);
}

/* 响应式优化 */
@media screen and (max-width: 375px) {
  .tab-icon {
    width: 56rpx;
    height: 56rpx;
  }
  .emoji {
    font-size: 32rpx;
  }
  .tab-label {
    font-size: 20rpx;
  }
}
</style>
