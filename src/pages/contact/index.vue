<template>
  <view class="contact-page">
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 公司信息卡片 -->
      <view class="info-card company-card">
        <view class="card-header">
          <view class="company-logo">
            <text class="logo-text">XX</text>
          </view>
          <view class="company-info">
            <text class="company-name">{{ contactInfo.company }}</text>
            <text class="company-desc">专业塑料制品解决方案提供商</text>
          </view>
        </view>
      </view>

      <!-- 联系方式卡片 -->
      <view class="info-card contact-card">
        <view class="card-title">
          <text class="title-text">联系方式</text>
        </view>
        
        <view class="contact-list">
          <view class="contact-item">
            <view class="contact-icon-wrapper phone">
              <text class="contact-icon">📞</text>
            </view>
            <view class="contact-details">
              <text class="contact-label">电话</text>
              <text class="contact-value">{{ contactInfo.phone }}</text>
            </view>
          </view>
          
          <view class="contact-item">
            <view class="contact-icon-wrapper email">
              <text class="contact-icon">✉️</text>
            </view>
            <view class="contact-details">
              <text class="contact-label">邮箱</text>
              <text class="contact-value">{{ contactInfo.email }}</text>
            </view>
          </view>
          
          <view class="contact-item">
            <view class="contact-icon-wrapper location">
              <text class="contact-icon">📍</text>
            </view>
            <view class="contact-details">
              <text class="contact-label">地址</text>
              <text class="contact-value">{{ contactInfo.address }}</text>
            </view>
          </view>
          
          
          <view class="contact-item" @tap="showQRCode">
            <view class="contact-icon-wrapper wechat">
              <text class="contact-icon">💬</text>
            </view>
            <view class="contact-details">
              <text class="contact-label">微信</text>
              <text class="contact-value wechat-value">点击添加微信</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 工作时间卡片 -->
      <view class="info-card time-card">
        <view class="card-title">
          <text class="title-text">工作时间</text>
        </view>
        <view class="time-info">
          <text class="time-text">周一至周五: 8:30 - 20:00</text>
          <text class="time-text">周六: 9:00 - 17:00</text>
          <text class="time-note">周日及法定节假日休息</text>
        </view>
      </view>
    </view>


  </view>

  <!-- 二维码弹窗 -->
  <view v-if="showQRModal" class="qr-modal" @tap="hideQRCode">
    <view class="qr-content" @tap.stop>
      <view class="qr-header">
        <text class="qr-title">添加我微信</text>
        <view class="close-btn" @tap="hideQRCode">
          <text class="close-icon">✕</text>
        </view>
      </view>
      <view class="qr-body">
        <view class="qr-code-wrapper">
          <!-- 这里可以放置真实的二维码图片 -->
          <view class="qr-placeholder">
            <text class="qr-placeholder-text">微信二维码</text>
            <text class="qr-placeholder-desc">请使用微信扫一扫</text>
          </view>
        </view>
        <text class="qr-tip">长按识别二维码或使用微信扫一扫</text>
      </view>
    </view>
  </view>
  
  <!-- 自定义底部导航栏 -->
  <CustomTabBar />
</template>

<script setup>
import { ref } from 'vue'
import { contactInfo } from '../../config.js'
import CustomTabBar from '../../components/CustomTabBar.vue'

// 控制二维码弹窗显示
const showQRModal = ref(false)

// 显示二维码
const showQRCode = () => {
  showQRModal.value = true
}

// 隐藏二维码
const hideQRCode = () => {
  showQRModal.value = false
}
</script>

<script>
export default {
  name: 'ContactPage',
  components: {
    CustomTabBar
  }
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40rpx 32rpx 180rpx 32rpx; /* 为自定义底部导航栏留出空间 */
}

/* 顶部标题区域 */
.header-section {
  text-align: center;
  margin-bottom: 60rpx;
  padding-top: 40rpx;
}

.page-title {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 16rpx;
  letter-spacing: -1rpx;
}

.page-subtitle {
  display: block;
  font-size: 28rpx;
  color: #718096;
  font-weight: 400;
  line-height: 1.6;
}

/* 主要内容区域 */
.main-content {
  max-width: 640rpx;
  margin: 0 auto;
}

/* 信息卡片通用样式 */
.info-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

/* 公司信息卡片 */
.company-card {
  margin-bottom: 40rpx;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.company-logo {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.logo-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
}

.company-info {
  text-align: center;
}

.company-name {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 12rpx;
  letter-spacing: 0.5rpx;
}

.company-desc {
  display: block;
  font-size: 26rpx;
  color: #718096;
  font-weight: 400;
  line-height: 1.5;
}

/* 卡片标题 */
.card-title {
  text-align: center;
  margin-bottom: 40rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #2d3748;
  letter-spacing: 0.5rpx;
}

/* 联系方式列表 */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
}

.contact-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.contact-icon-wrapper.phone {
  background: #e6fffa;
}

.contact-icon-wrapper.email {
  background: #fef5e7;
}

.contact-icon-wrapper.location {
  background: #f0f9ff;
}

.contact-icon-wrapper.wechat {
  background: #e8f5e8;
}

.contact-icon {
  font-size: 32rpx;
}

.contact-details {
  flex: 1;
}

.contact-label {
  display: block;
  font-size: 24rpx;
  color: #718096;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.contact-value {
  display: block;
  font-size: 30rpx;
  color: #2d3748;
  font-weight: 600;
  letter-spacing: 0.5rpx;
}

.wechat-value {
  color: #07c160;
  cursor: pointer;
}

.wechat-icon-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #07c160;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 工作时间卡片 */
.time-info {
  text-align: center;
}

.time-text {
  display: block;
  font-size: 28rpx;
  color: #4a5568;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.time-note {
  display: block;
  font-size: 24rpx;
  color: #a0aec0;
  margin-top: 16rpx;
  font-style: italic;
}



/* 二维码弹窗样式 */
.qr-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.qr-content {
  background: #ffffff;
  border-radius: 24rpx;
  width: 600rpx;
  max-width: 90vw;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

.qr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.qr-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:active {
  background: #e8e8e8;
}

.close-icon {
  font-size: 28rpx;
  color: #666666;
}

.qr-body {
  padding: 40rpx;
  text-align: center;
}

.qr-code-wrapper {
  margin-bottom: 40rpx;
}

.qr-placeholder {
  width: 400rpx;
  height: 400rpx;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #dee2e6;
}

.qr-placeholder-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 16rpx;
}

.qr-placeholder-desc {
  font-size: 24rpx;
  color: #adb5bd;
}

.qr-tip {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 750px) {
  .page-title {
    font-size: 48rpx;
  }
  
  .company-name {
    font-size: 36rpx;
  }
  
  .contact-value {
    font-size: 26rpx;
  }
}
</style>
