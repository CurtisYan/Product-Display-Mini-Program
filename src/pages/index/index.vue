<template>
  <view class="container">
    <!-- 左：分类栏 -->
    <scroll-view class="col col-left" scroll-y>
      <view class="section-title">分类</view>
      <view class="category-item active">塑料包装</view>
      <view class="category-item">塑料袋</view>
      <view class="category-item">塑料瓶</view>
      <view class="category-item">收纳盒</view>
      <view class="category-item">更多…</view>
    </scroll-view>

    <!-- 中：产品陈列 -->
    <scroll-view class="col col-middle" scroll-y>
      <view class="section-title">主流产品</view>
      <view class="product-grid">
        <view class="product-card" v-for="i in 6" :key="i">
          <image class="product-image" src="/static/logo.png" mode="aspectFill" />
          <view class="product-info">
            <text class="product-title">示例产品 {{ i }}</text>
            <text class="product-sub">支持定制 · 高品质</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 右：联系我们 -->
    <view class="col col-right">
      <view class="section-title">联系我们</view>
      <view class="contact-card">
        <text class="contact-name">XX 塑料科技有限公司</text>
        <text class="contact-line">电话：400-000-0000</text>
        <text class="contact-line">邮箱：contact@example.com</text>
        <text class="contact-line">地址：广东·佛山</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 预留：后续接入真实分类与产品数据
    }
  },
  onLoad() {},
  methods: {},
}
</script>

<style>
.container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  box-sizing: border-box;
}

.col {
  box-sizing: border-box;
  border-right: 1px solid #f0f0f0;
}

.col-left {
  width: 25%;
  background: #fafafa;
  padding: 16rpx;
}

.col-middle {
  width: 55%;
  padding: 16rpx;
}

.col-right {
  width: 20%;
  padding: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.category-item {
  padding: 16rpx 12rpx;
  margin-bottom: 12rpx;
  border-radius: 8rpx;
  background: #ffffff;
  color: #333;
}

.category-item.active {
  background: #eaf3ff;
  color: #1677ff;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.product-card {
  background: #ffffff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
}

.product-image {
  width: 100%;
  height: 220rpx;
  background: #f5f5f5;
}

.product-info {
  padding: 12rpx 16rpx 16rpx;
}

.product-title {
  font-size: 26rpx;
  color: #111;
}

.product-sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #8f8f94;
}

.contact-card {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
}

.contact-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #111;
}

.contact-line {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #555;
}
</style>
