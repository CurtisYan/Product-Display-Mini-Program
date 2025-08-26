<template>
  <view v-if="visible" class="tg-container" @touchmove.stop.prevent="onContainerTouchMove">
    <!-- 遮罩层 -->
    <view class="tg-mask" :style="{ opacity: maskOpacity }" @tap="close"></view>

    <!-- 底部弹出层（Telegram风格：仅用transform/opacity动画） -->
    <view class="tg-sheet" :style="{ transform: `translate3d(0, ${translateY}px, 0)`, transition: transition, height: sheetHeight + 'px' }">
      <!-- 顶部拖拽区（整个区域支持手势） -->
      <view class="tg-drag-zone" @touchstart="onDragStart" @touchmove.stop="onDragMove" @touchend="onDragEnd">
        <view class="tg-handle"></view>
        <view class="tg-header">
          <view class="tg-title-area">
            <text class="tg-title">{{ product?.name || '产品详情' }}</text>
            <text class="tg-sub" v-if="product?.sub">{{ product.sub }}</text>
          </view>
          <view class="tg-actions">
            <!-- 微信小程序使用 button 组件实现分享 -->
            <!-- #ifdef MP-WEIXIN -->
            <button class="tg-share-btn" open-type="share" data-nodrag="1">
              <text class="tg-action-text">分享</text>
            </button>
            <!-- #endif -->
            <!-- 非微信环境使用普通按钮 -->
            <!-- #ifndef MP-WEIXIN -->
            <view class="tg-action-btn" data-nodrag="1" @tap.stop="onShare"><text class="tg-action-text">分享</text></view>
            <!-- #endif -->
            <view class="tg-action-btn" :class="{ active: favoriteActive }" data-nodrag="1" @tap.stop="onFavorite"><text class="tg-action-text">{{ favoriteActive ? '已收藏' : '收藏' }}</text></view>
          </view>
        </view>
      </view>

      <!-- 内容区：独立滚动，不与拖拽冲突 -->
      <scroll-view
        class="tg-content"
        scroll-y
        :style="{ maxHeight: maxHeight + 'px' }"
        enhanced
        show-scrollbar="false"
        @scroll="onScroll"
      >
        <!-- 描述信息放到图片之上 -->
        <view class="tg-desc" v-if="product?.description || product?.desc">
          <text class="tg-desc-text">{{ product.description || product.desc }}</text>
        </view>

        <!-- 图片列表：垂直依次展示，多图纵向排列 -->
        <view v-if="displayImages.length" class="tg-image-list">
          <image v-for="(img, idx) in displayImages" :key="idx" class="tg-image" :src="img" mode="aspectFill" @tap="preview(idx)" />
        </view>

        <!-- 插槽拓展 -->
        <slot />

        <view class="tg-safe" />
      </scroll-view>
    </view>
    
    <!-- 分享引导组件 -->
    <ShareGuide ref="shareGuide" subtitle="分享给朋友或保存图片" />
  </view>
</template>

<script>
import { setupPageShare, showShareMenu, saveShareRecord } from '../utils/share.js'
import ShareGuide from './ShareGuide.vue'

export default {
  name: 'ProductDetailDrawer',
  components: {
    ShareGuide
  },
  emits: ['update:modelValue', 'favorite', 'share'],
  props: {
    modelValue: { type: Boolean, default: false },
    product: { type: Object, default: null },
    images: { type: Array, default: () => [] }
  },
  data() {
    return {
      visible: false,
      transition: 'none',
      translateY: 1000,
      maskOpacity: 0,
      height: 0,
      touching: false,
      startY: 0,
      startT: 0,
      maxHeight: 0,
      isAtTop: true,
      // 目标高度相关（支持折叠/展开两个高度）
      sheetHeight: 0,
      collapsedRatio: 0.8,
      expandedRatio: 0.96,
      collapsedHeight: 0,
      expandedHeight: 0,
      expanded: false,
      chromePx: 88,
      safeBottom: 0,
      // 历史管理
      pushed: false,
      boundPopstate: null,
      popAttached: false,
      favoriteActive: false,
      // 手势相关
      isDragging: false,
      dragStartY: 0,
      dragStartTime: 0,
      lastY: 0,
      lastTime: 0,
      velocity: 0,
      dragActivated: false,
      totalDragDistance: 0
    }
  },
  computed: {
    displayImages() {
      if (this.images && this.images.length) return this.images
      if (this.product?.images && this.product.images.length) return this.product.images
      return []
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) this.open()
        else this.close(false, true)
      }
    },
    product: {
      immediate: false,
      handler() {
        this.determineFavoriteState()
      }
    }
  },
  mounted() {
    this.computeMaxHeight()
    if (uni && uni.onWindowResize) {
      uni.onWindowResize(this.computeMaxHeight)
    }
    if (typeof window !== 'undefined' && window.addEventListener) {
      this.boundPopstate = (e) => this.onPopstate(e)
      window.addEventListener('popstate', this.boundPopstate)
      this.popAttached = true
    }
  },
  beforeUnmount() {
    if (uni && uni.offWindowResize) {
      uni.offWindowResize(this.computeMaxHeight)
    }
    if (typeof window !== 'undefined' && this.boundPopstate) {
      window.removeEventListener('popstate', this.boundPopstate)
      this.boundPopstate = null
      this.popAttached = false
      this.pushed = false
    }
  },
  methods: {
    onPopstate(e) {
      if (this.visible) {
        this.close(true, true)
      }
    },
    computeMaxHeight() {
      try {
        const sys = uni.getSystemInfoSync()
        const safeBottom = sys.safeAreaInsets?.bottom || 0
        const winH = sys.windowHeight || 800
        this.safeBottom = safeBottom
        this.collapsedHeight = Math.round(winH * this.collapsedRatio)
        this.expandedHeight = Math.round(winH * this.expandedRatio)
        this.sheetHeight = this.expanded ? this.expandedHeight : this.collapsedHeight
        // 内容区最大高度 = 目标高度 - 顶部拖拽/标题区域 - 底部安全区
        this.maxHeight = Math.max(200, this.sheetHeight - this.chromePx - safeBottom)
      } catch (e) {
        this.sheetHeight = 700
        this.collapsedHeight = 560
        this.expandedHeight = 860
        this.maxHeight = 600
      }
    },
    measureHeight(cb) {
      // 直接使用计算的目标高度，避免受图片加载或布局抖动影响
      this.height = this.sheetHeight || 800
      cb && cb()
    },
    open() {
      if (this.visible) return
      this.visible = true
      // 锁定页面滚动
      this.lockPageScroll()
      // 恢复为折叠态并重新计算布局
      this.expanded = false
      this.computeMaxHeight()
      // 计算当前商品是否已被收藏，用于按钮状态显示
      this.determineFavoriteState()
      if (typeof window !== 'undefined' && window.history && !this.pushed) {
        try { window.history.pushState({ sheet: 'product-detail' }, '') } catch (e) {}
        this.pushed = true
      }
      this.$nextTick(() => {
        setTimeout(() => {
          this.measureHeight(() => {
            this.transition = 'none'
            this.translateY = this.height
            this.maskOpacity = 0
            // 下一帧启动入场动画
            setTimeout(() => {
              this.transition = 'transform 0.28s cubic-bezier(.21,1,.34,1)'
              this.translateY = 0
              this.maskOpacity = 1
            }, 16)
          })
        }, 0)
      })
    },
    close(emitUpdate = true, fromHistory = false) {
      if (!this.visible) {
        if (emitUpdate && this.modelValue) this.$emit('update:modelValue', false)
        return
      }
      if (typeof window !== 'undefined' && this.pushed && !fromHistory) {
        try { window.history.back() } catch (e) {}
        return
      }
      this.transition = 'transform 0.22s cubic-bezier(.2,.6,.2,1)'
      this.translateY = this.height || 800
      this.maskOpacity = 0
      setTimeout(() => {
        this.visible = false
        this.pushed = false
        // 恢复页面滚动
        this.unlockPageScroll()
        if (emitUpdate && this.modelValue) this.$emit('update:modelValue', false)
      }, 220)
    },
    // 内容滚动，记录是否在顶部（用于与旧逻辑兼容）
    onScroll(e) {
      this.isAtTop = (e?.detail?.scrollTop || 0) <= 5
    },
    // 统一的拖拽处理
    onDragStart(e) {
      // 检查是否点击在按钮上
      if (e.target && e.target.dataset && e.target.dataset.nodrag) return
      
      this.isDragging = true
      this.dragActivated = false // 还未真正激活拖拽
      this.totalDragDistance = 0
      this.dragStartY = e.touches[0].clientY
      this.dragStartTime = Date.now()
      this.lastY = this.dragStartY
      this.lastTime = this.dragStartTime
      this.velocity = 0
      this.startY = this.dragStartY
      this.startT = this.dragStartTime
    },
    
    onDragMove(e) {
      if (!this.isDragging) return
      
      const currentY = e.touches[0].clientY
      const currentTime = Date.now()
      const deltaY = currentY - this.dragStartY
      
      // 累积移动距离
      this.totalDragDistance = Math.abs(deltaY)
      
      // 只有移动超过10px才真正激活拖拽，避免点击误触
      if (!this.dragActivated && this.totalDragDistance < 10) {
        return
      }
      
      // 激活拖拽
      if (!this.dragActivated) {
        this.dragActivated = true
        this.transition = 'none'
      }
      
      e.preventDefault && e.preventDefault()
      
      // 计算瞬时速度
      const dt = currentTime - this.lastTime
      if (dt > 0) {
        this.velocity = (currentY - this.lastY) / dt * 1000
      }
      this.lastY = currentY
      this.lastTime = currentTime
      
      if (deltaY < 0) {
        // 向上拖拽：增加高度
        const absdy = Math.abs(deltaY)
        const base = this.expanded ? this.expandedHeight : this.collapsedHeight
        const target = Math.min(this.expandedHeight, base + absdy * 0.5) // 增加阻尼
        this.sheetHeight = target
        this.maxHeight = Math.max(200, this.sheetHeight - this.chromePx - (this.safeBottom || 0))
        this.translateY = 0
      } else {
        // 向下拖拽
        if (this.expanded) {
          // 展开态：先收缩高度
          const heightDiff = this.expandedHeight - this.collapsedHeight
          if (deltaY <= heightDiff) {
            // 还在收缩阶段
            this.sheetHeight = this.expandedHeight - deltaY
            this.maxHeight = Math.max(200, this.sheetHeight - this.chromePx - (this.safeBottom || 0))
            this.translateY = 0
          } else {
            // 收缩完成，开始位移
            this.sheetHeight = this.collapsedHeight
            this.maxHeight = Math.max(200, this.sheetHeight - this.chromePx - (this.safeBottom || 0))
            this.translateY = deltaY - heightDiff
          }
        } else {
          // 折叠态：直接位移
          this.translateY = deltaY
        }
        this.maskOpacity = 1 - Math.min(this.translateY / 400, 0.8)
      }
    },
    
    onDragEnd(e) {
      if (!this.isDragging) return
      this.isDragging = false
      
      // 如果没有真正激活拖拽（只是点击），不做任何处理
      if (!this.dragActivated) {
        return
      }
      
      const deltaY = this.lastY - this.dragStartY
      const v = this.velocity // px/s
      
      // 基于速度和位置判断意图
      if (deltaY < 0) {
        // 向上：判断是否展开
        const shouldExpand = this.sheetHeight > (this.collapsedHeight + this.expandedHeight) / 2 || v < -500
        if (shouldExpand) {
          this.expandToFull()
        } else {
          this.collapseToMedium()
        }
      } else {
        // 向下
        if (this.translateY > 0) {
          // 已经有位移：判断是否关闭
          const shouldClose = this.translateY > this.collapsedHeight * 0.25 || v > 800
          if (shouldClose) {
            this.close()
          } else {
            // 回弹到折叠态
            this.transition = 'transform 0.24s cubic-bezier(.21,1,.34,1)'
            this.translateY = 0
            this.maskOpacity = 1
            if (this.sheetHeight < this.collapsedHeight) {
              this.collapseToMedium()
            }
          }
        } else {
          // 只有高度变化：判断停在哪档
          if (this.expanded) {
            // 展开态下拉：更倾向于收缩到默认档
            // 只有当高度非常接近展开高度或速度为强烈上滑时才保持展开
            const threshold = this.expandedHeight * 0.9 // 90%以上才可能保持
            const shouldStayExpanded = this.sheetHeight > threshold && v < 200 // 且速度不是向下
            if (shouldStayExpanded) {
              this.expandToFull()
            } else {
              this.collapseToMedium()
            }
          } else {
            // 折叠态上拉：正常判断
            const mid = (this.collapsedHeight + this.expandedHeight) / 2
            if (this.sheetHeight > mid || v < -300) {
              this.expandToFull()
            } else {
              this.collapseToMedium()
            }
          }
        }
      }
    },
    preview(idx) {
      if (!this.displayImages.length) return
      uni.previewImage({ current: idx, urls: this.displayImages })
    },
    onShare() {
      // 组件内部直接处理分享逻辑
      try {
        // #ifdef MP-WEIXIN
        // 微信小程序：显示分享按钮
        const shareOptions = setupPageShare({ product: this.product })
        
        // 调用微信分享接口
        uni.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline'], // 分享到聊天和朋友圈
          success: () => {
            console.log('显示分享菜单成功')
            
            // 设置分享内容
            uni.updateShareMenu({
              withShareTicket: true,
              success: () => {
                console.log('更新分享菜单成功')
              }
            })
          },
          fail: (err) => {
            console.error('显示分享菜单失败:', err)
            // 降级方案：显示操作菜单
            this.showShareActionSheet()
          }
        })
        
        // 保存分享记录
        saveShareRecord(this.product, 'menu')
        
        // 显示可视化引导（替代 toast）
        if (this.$refs.shareGuide) {
          this.$refs.shareGuide.show()
        } else {
          // 降级方案：使用 toast
          uni.showToast({
            title: '点击右上角三个点进行分享',
            icon: 'none',
            duration: 2000
          })
        }
        // #endif
        
        // #ifndef MP-WEIXIN
        // 非微信环境：显示分享选项
        this.showShareActionSheet()
        // #endif
        
        // 通知父组件（如果需要额外处理）
        this.$emit('share', this.product)
      } catch (e) {
        console.error('分享失败:', e)
        uni.showToast({ title: '分享功能暂不可用', icon: 'none' })
      }
    },
    
    // 显示分享操作菜单
    showShareActionSheet() {
      const product = this.product
      if (!product) return
      
      uni.showActionSheet({
        itemList: ['分享给朋友', '生成分享海报', '复制商品信息'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 分享给朋友
            this.shareToFriend()
          } else if (res.tapIndex === 1) {
            // 生成海报
            this.generatePoster()
          } else if (res.tapIndex === 2) {
            // 复制信息
            this.copyProductInfo()
          }
        }
      })
    },
    
    // 分享给朋友
    shareToFriend() {
      // #ifdef MP-WEIXIN
      uni.showToast({
        title: '请点击右上角三个点进行分享',
        icon: 'none'
      })
      // #endif
      
      // #ifndef MP-WEIXIN
      const shareText = `【${this.product.name}】${this.product.sub || ''}\n查看详情：${this.getProductUrl()}`
      uni.setClipboardData({
        data: shareText,
        success: () => {
          uni.showToast({
            title: '已复制分享内容',
            icon: 'success'
          })
        }
      })
      // #endif
    },
    
    // 生成分享海报
    generatePoster() {
      uni.showLoading({ title: '生成中...' })
      
      // 跳转到海报生成页面
      setTimeout(() => {
        uni.hideLoading()
        uni.navigateTo({
          url: `/pages/poster/index?productId=${this.product.id}&productName=${encodeURIComponent(this.product.name)}&productImage=${encodeURIComponent(this.product.image || this.product.images?.[0] || '')}`
        })
      }, 500)
    },
    
    // 复制商品信息
    copyProductInfo() {
      const info = `商品名称：${this.product.name}\n${this.product.sub ? '商品描述：' + this.product.sub : ''}`
      uni.setClipboardData({
        data: info,
        success: () => {
          uni.showToast({
            title: '已复制商品信息',
            icon: 'success'
          })
          saveShareRecord(this.product, 'copy')
        }
      })
    },
    
    // 获取商品链接
    getProductUrl() {
      // 这里可以返回 H5 页面链接或小程序路径
      return `pages/showcase/index?productId=${this.product.id}`
    },
    onFavorite() {
      // 组件内部直接处理收藏逻辑
      try {
        const favorites = uni.getStorageSync('favoriteProducts') || []
        let favoriteList = Array.isArray(favorites) ? favorites : []
        
        const existIndex = favoriteList.findIndex(p => p && p.id === this.product.id)
        
        if (existIndex === -1) {
          // 添加收藏
          favoriteList.push({
            ...this.product,
            favoriteTime: Date.now()
          })
          this.favoriteActive = true
          uni.showToast({ title: '已添加收藏', icon: 'success' })
        } else {
          // 取消收藏
          favoriteList.splice(existIndex, 1)
          this.favoriteActive = false
          uni.showToast({ title: '已取消收藏', icon: 'success' })
        }
        
        // 保存到本地存储
        uni.setStorageSync('favoriteProducts', favoriteList)
        
        // 通知父组件更新（如果需要的话）
        this.$emit('favorite', this.product, this.favoriteActive)
      } catch (e) {
        console.error('处理收藏失败:', e)
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },
    expandToFull() {
      this.expanded = true
      this.transition = 'transform 0.24s cubic-bezier(.21,1,.34,1), height 0.22s cubic-bezier(.21,1,.34,1)'
      this.sheetHeight = this.expandedHeight
      this.maxHeight = Math.max(200, this.sheetHeight - this.chromePx - (this.safeBottom || 0))
    },
    collapseToMedium() {
      this.expanded = false
      this.transition = 'transform 0.24s cubic-bezier(.21,1,.34,1), height 0.22s cubic-bezier(.2,.6,.2,1)'
      this.sheetHeight = this.collapsedHeight
      this.maxHeight = Math.max(200, this.sheetHeight - this.chromePx - (this.safeBottom || 0))
    },
    // 读取统一的收藏存储，判断是否已收藏
    determineFavoriteState() {
      try {
        const id = this.product?.id
        if (!id) { this.favoriteActive = false; return }
        
        // 只从统一的存储位置读取
        const favorites = uni.getStorageSync('favoriteProducts')
        if (!favorites) {
          this.favoriteActive = false
          return
        }
        
        // 兼容不同的存储格式
        let favoriteList = []
        if (typeof favorites === 'string') {
          try {
            favoriteList = JSON.parse(favorites)
          } catch (e) {
            favoriteList = []
          }
        } else if (Array.isArray(favorites)) {
          favoriteList = favorites
        }
        
        // 检查当前商品是否在收藏列表中
        this.favoriteActive = favoriteList.some(p => p && p.id === id)
      } catch (e) {
        console.error('读取收藏状态失败:', e)
        this.favoriteActive = false
      }
    },
    // 锁定底层页面滚动
    lockPageScroll() {
      // H5环境
      if (typeof document !== 'undefined') {
        const scrollY = window.scrollY
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollY}px`
        document.body.style.width = '100%'
        document.body.dataset.scrollY = String(scrollY)
      }
    },
    // 解锁底层页面滚动
    unlockPageScroll() {
      // H5环境
      if (typeof document !== 'undefined') {
        const scrollY = Number(document.body.dataset.scrollY || 0)
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    },
    // 容器touchmove处理：允许内部滚动但阻止冒泡
    onContainerTouchMove(e) {
      // 如果是在拖拽中，阻止默认行为
      if (this.isDragging) {
        e.preventDefault && e.preventDefault()
      }
      // 始终阻止事件冒泡到外层
      e.stopPropagation && e.stopPropagation()
    },
    noop() {}
  }
}
</script>

<style scoped>
/* Telegram 风格：transform/opacity 动画 + 顶部拖拽区 */
.tg-container { position: fixed; inset: 0; z-index: 3000; overscroll-behavior: contain; touch-action: none; }
.tg-mask { position: absolute; inset: 0; background: rgba(0,0,0,.45); opacity: 0; }
.tg-sheet { position: absolute; left: 0; right: 0; bottom: 0; background: #fff; border-radius: 20rpx 20rpx 0 0; box-shadow: 0 -16rpx 80rpx rgba(0,0,0,0.18); will-change: transform; transform: translate3d(0, 100%, 0); }

.tg-drag-zone { padding: 16rpx 24rpx 8rpx; user-select: none; }
.tg-handle { width: 96rpx; height: 8rpx; background: #e5e5e7; border-radius: 999rpx; margin: 0 auto 16rpx; }
.tg-header { display: flex; align-items: center; justify-content: space-between; }
.tg-title-area { max-width: 70%; }
.tg-title { display: block; font-size: 32rpx; font-weight: 700; color: #111827; line-height: 1.3; }
.tg-sub { display: block; margin-top: 6rpx; font-size: 24rpx; color: #6b7280; }
.tg-actions { display: flex; align-items: center; gap: 12rpx; }
.tg-action-btn { min-width: 88rpx; height: 56rpx; padding: 0 16rpx; background: #f3f4f6; border-radius: 28rpx; display: flex; align-items: center; justify-content: center; }
.tg-action-btn.active { background: #e9e5ff; }
.tg-action-btn.active .tg-action-text { color: #6a5acd; font-weight: 700; }
.tg-action-btn:active { transform: scale(0.98); }
.tg-action-text { font-size: 24rpx; color: #374151; font-weight: 600; }
/* 微信分享按钮样式 */
.tg-share-btn { 
  min-width: 88rpx; 
  height: 56rpx; 
  padding: 0 16rpx; 
  background: #f3f4f6; 
  border-radius: 28rpx; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  border: none;
  margin: 0;
  line-height: 1;
  font-size: inherit;
  color: inherit;
  box-sizing: border-box;
}
.tg-share-btn::after { display: none; }
.tg-share-btn:active { transform: scale(0.98); background: #e5e7eb; }
.tg-close-btn { width: 56rpx; height: 56rpx; border-radius: 50%; background: #F6F8FA; display: flex; align-items: center; justify-content: center; margin-left: 8rpx; }
.tg-close-icon { font-size: 40rpx; color: #6b7280; line-height: 1; }

.tg-content { padding: 0 24rpx 16rpx; touch-action: pan-y; }
.tg-image-list { display: flex; flex-direction: column; gap: 12rpx; margin: 8rpx 0 16rpx; }
.tg-image { width: 100%; height: 420rpx; border-radius: 20rpx; background: #f3f4f6; overflow: hidden; }
/* 确保外层固定高度生效 */
.tg-sheet { overflow: hidden; }
.tg-desc { margin: 8rpx 0 16rpx; }
.tg-desc-text { font-size: 26rpx; color: #374151; line-height: 1.6; }
.tg-cta { display: flex; gap: 12rpx; padding-top: 16rpx; }
.btn { flex: 1; background: #f7f7f7; color: #333; border-radius: 12rpx; padding: 14rpx 0; font-size: 28rpx; display: flex; align-items: center; justify-content: center; }
.btn.primary { background: #1677ff; color: #fff; }
.btn.favorite { background: #ff4757; color: #fff; }
.favorite-icon { font-size: 32rpx; margin-right: 8rpx; }
.tg-safe { height: env(safe-area-inset-bottom); }
</style>
