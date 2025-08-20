<template>
  <view>
    <view v-if="modelValue" class="mask" @tap="close" />
    <view ref="drawer" class="drawer" :class="{ show: modelValue }" 
          @touchstart="onTouchStart" 
          @touchmove="onTouchMove" 
          @touchend="onTouchEnd">
      <view class="handle" @tap="close"></view>
      <scroll-view scroll-y class="sheet" @scroll="onScroll" :scroll-top="scrollTop">
        <view class="header">
          <text class="title">{{ product?.name || '产品详情' }}</text>
          <text class="sub" v-if="product?.sub">{{ product.sub }}</text>
        </view>
        <scroll-view class="gallery" scroll-x>
          <image v-for="(img,idx) in images" :key="idx" class="g-img" :src="img" mode="aspectFill" @tap="preview(idx)" />
        </scroll-view>
        <view class="desc">
          <slot>
            <text class="p">这里是产品文字说明示例。支持材质、规格、用途、工艺等信息的分段展示。</text>
          </slot>
        </view>
        <view class="cta">
          <button class="btn primary" @tap="shareProduct">分享转发</button>
          <button class="btn favorite" @tap="addToFavorite">
            <text class="favorite-icon">♥</text>
            <text>添加收藏</text>
          </button>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProductDetailDrawer',
  props: {
    modelValue: { type: Boolean, default: false },
    product: { type: Object, default: null },
    images: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue', 'share', 'favorite'],
  data() {
    return {
      // 触摸相关
      startY: 0,
      currentY: 0,
      isDragging: false,
      // 滚动相关
      scrollTop: 0,
      isAtTop: true,
      // 动画相关
      drawerStyle: ''
    }
  },
  methods: {
    close() { this.$emit('update:modelValue', false) },
    preview(idx) {
      if (!this.images || !this.images.length) return
      uni.previewImage({ current: idx, urls: this.images })
    },
    shareProduct() {
      this.$emit('share', this.product)
      // 微信小程序分享功能
      uni.showShareMenu({
        withShareTicket: true,
        success: () => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        }
      })
    },
    addToFavorite() {
      this.$emit('favorite', this.product)
      uni.showToast({
        title: '已收藏进星星内',
        icon: 'success',
        duration: 3000
      })
    },
    // 滚动监听，检测是否在顶部
    onScroll(e) {
      this.scrollTop = e.detail.scrollTop
      this.isAtTop = e.detail.scrollTop <= 5 // 允许5px的误差
    },
    // 触摸开始
    onTouchStart(e) {
      if (!this.isAtTop) return // 不在顶部时不处理
      this.startY = e.touches[0].clientY
      this.isDragging = false
    },
    // 触摸移加
    onTouchMove(e) {
      if (!this.isAtTop) return // 不在顶部时不处理
      
      this.currentY = e.touches[0].clientY
      const deltaY = this.currentY - this.startY
      
      // 只处理向下滑动
      if (deltaY > 0) {
        this.isDragging = true
        // 阻止默认滚动行为
        e.preventDefault && e.preventDefault()
        
        // 使用uni-app的方式获取DOM元素
        const query = uni.createSelectorQuery().in(this)
        query.select('.drawer').boundingClientRect(rect => {
          if (rect) {
            // 计算进度和变换
            const progress = Math.min(deltaY / 200, 1)
            this.drawerTransform = `translateY(${deltaY}px)`
            this.drawerOpacity = 1 - progress * 0.3
          }
        }).exec()
      }
    },
    // 触摸结束
    onTouchEnd(e) {
      if (!this.isAtTop || !this.isDragging) {
        this.resetDrawerPosition()
        return
      }
      
      const deltaY = this.currentY - this.startY
      const threshold = 100 // 关闭阈值：100px
      
      if (deltaY > threshold) {
        // 超过阈值，关闭弹窗
        this.close()
      } else {
        // 未超过阈值，回弹到原位置
        this.resetDrawerPosition()
      }
      
      this.isDragging = false
    },
    // 重置弹窗位置
    resetDrawerPosition() {
      const drawer = this.$refs.drawer || document.querySelector('.drawer')
      if (drawer) {
        drawer.style.transform = ''
        drawer.style.opacity = ''
      }
    }
  }
}
</script>

<style>
.mask { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 1100; }
.drawer { position: fixed; left: 0; right: 0; bottom: -85vh; height: 85vh; background: #fff; border-top-left-radius: 20rpx; border-top-right-radius: 20rpx; z-index: 1101; box-shadow: 0 -8rpx 20rpx rgba(0,0,0,.08); transition: bottom .22s ease; }
.drawer.show { bottom: 0; }
.handle { width: 120rpx; height: 10rpx; border-radius: 10rpx; background: #e5e5e5; margin: 14rpx auto; }
.sheet { height: calc(90vh - 24rpx); padding: 0 20rpx 24rpx; box-sizing: border-box; }
.header { margin: 8rpx 4rpx 12rpx; }
.title { font-size: 30rpx; font-weight: 600; color: #111; }
.sub { display:block; margin-top: 6rpx; font-size: 22rpx; color: #8f8f94; }
.gallery { display: flex; flex-direction: row; gap: 12rpx; padding: 8rpx 0 16rpx; }
.g-img { width: 240rpx; height: 240rpx; border-radius: 12rpx; background: #f5f5f5; }
.desc { color: #444; font-size: 24rpx; line-height: 1.6; padding: 8rpx 4rpx; }
.p { color:#555; }
.cta { display: flex; gap: 12rpx; padding-top: 16rpx; }
.btn { flex: 1; background: #f7f7f7; color: #333; border-radius: 12rpx; padding: 14rpx 0; font-size: 28rpx; display: flex; align-items: center; justify-content: center; }
.btn.primary { background: #1677ff; color: #fff; }
.btn.favorite { background: #ff4757; color: #fff; }
.favorite-icon { font-size: 32rpx; margin-right: 8rpx; }
</style>
