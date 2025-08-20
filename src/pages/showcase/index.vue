<template>
  <view class="showcase-page">
    <!-- 现代化导航栏 -->
    <view class="modern-header">
      <view class="header-background"></view>
      <view class="header-content">
        <view class="header-left">
          <view class="title-container">
            <text class="page-title">主流产品展示</text>
            <view class="title-decoration"></view>
          </view>
          <view class="favorite-btn" @tap="showFavoriteDrawer">
            <view class="favorite-icon-wrapper">
              <text class="star-icon">⭐</text>
              <view class="favorite-badge" v-if="favoriteProducts.length > 0">
                <text class="badge-text">{{ favoriteProducts.length }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="header-search">
          <view class="modern-search-box">
            <view class="search-input-wrapper">
              <input
                class="search-input"
                type="text"
                placeholder="搜索你想要的产品..."
                v-model="searchKeyword"
                @input="onSearchInput"
                @confirm="onSearchConfirm"
              />
              <view class="search-icon" @tap="onSearchConfirm">
                <icon type="search" size="16" color="#999" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 产品展示区域 -->
    <view class="content-wrap">
      <view class="grid" v-if="displayProducts.length">
        <view class="card" v-for="p in displayProducts" :key="p.id" @tap="openDetail(p)" hover-class="card-hover">
          <image class="img" :src="p.image" mode="aspectFill" />
          <view class="info">
            <text class="title">{{ p.name }}</text>
            <text class="sub" v-if="p.sub">{{ p.sub }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-products">
        <text class="empty-text">{{ isSearchMode ? '未找到相关产品' : '暂无产品' }}</text>
      </view>
    </view>

    <!-- 详情抽屉 -->
    <ProductDetailDrawer 
      v-model="showProductDetail"
      :product="selectedProduct"
      :images="detailImages"
      @favorite="onProductFavorite"
    />

    <!-- 收藏夹抽屉 -->
    <view v-if="showFavorites" class="favorite-mask" @tap="hideFavoriteDrawer" />
    <view class="favorite-drawer" :class="{ 'favorite-drawer--show': showFavorites }">
      <view class="favorite-header">
        <text class="favorite-title">我的收藏</text>
        <view class="close-btn" @tap="hideFavoriteDrawer">
          <text class="close-icon">×</text>
        </view>
      </view>
      <scroll-view class="favorite-content" scroll-y>
        <view v-if="favoriteProducts.length === 0" class="empty-favorites">
          还没有收藏任何产品
        </view>
        <view v-else class="favorite-list">
          <view 
            v-for="product in favoriteProducts" 
            :key="product.id" 
            class="favorite-item"
            @tap="openDetail(product)"
          >
            <image class="favorite-image" :src="product.image" mode="aspectFill" />
            <view class="favorite-info">
              <text class="favorite-name">{{ product.name }}</text>
              <text class="favorite-desc" v-if="product.sub">{{ product.sub }}</text>
            </view>
            <view class="remove-favorite" @tap.stop="removeFavorite(product.id)">
              <text class="remove-icon">🗑️</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 自定义底部导航栏 -->
    <CustomTabBar />
  </view>
</template>

<script>
import CustomTabBar from '../../components/CustomTabBar.vue'
import ProductDetailDrawer from '../../components/ProductDetailDrawer.vue'
import { getShowcaseProducts } from '../../shared/products.js'

export default {
  name: 'ShowcasePage',
  components: {
    CustomTabBar,
    ProductDetailDrawer
  },
  data() {
    return {
      products: getShowcaseProducts(), // 从统一产品库获取展示页产品
      showProductDetail: false,
      selectedProduct: null,
      searchKeyword: '',
      isSearchMode: false,
      showFavorites: false,
      favoriteProducts: [] // 收藏的产品列表
    }
  },
  computed: {
    detailImages() {
      const p = this.selectedProduct
      return p && p.images ? p.images : []
    },
    displayProducts() {
      if (this.isSearchMode && this.searchKeyword.trim()) {
        return this.products.filter(p => 
          p.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          (p.sub && p.sub.toLowerCase().includes(this.searchKeyword.toLowerCase()))
        )
      }
      return this.products
    }
  },
  created() {
    // 从本地存储加载收藏列表
    this.loadFavorites()
  },
  methods: {
    openDetail(p) {
      this.selectedProduct = p
      this.showProductDetail = true
    },
    onSearchInput() {
      this.isSearchMode = this.searchKeyword.trim().length > 0
    },
    onSearchConfirm() {
      this.isSearchMode = this.searchKeyword.trim().length > 0
    },
    showFavoriteDrawer() {
      this.showFavorites = true
    },
    hideFavoriteDrawer() {
      this.showFavorites = false
    },
    onProductFavorite(product) {
      const index = this.favoriteProducts.findIndex(p => p.id === product.id)
      if (index === -1) {
        this.favoriteProducts.push(product)
        uni.showToast({ title: '已添加到收藏', icon: 'success' })
      } else {
        this.favoriteProducts.splice(index, 1)
        uni.showToast({ title: '已取消收藏', icon: 'success' })
      }
      this.saveFavorites()
    },
    removeFavorite(productId) {
      const index = this.favoriteProducts.findIndex(p => p.id === productId)
      if (index !== -1) {
        this.favoriteProducts.splice(index, 1)
        this.saveFavorites()
        uni.showToast({ title: '已移除收藏', icon: 'success' })
      }
    },
    loadFavorites() {
      try {
        const favorites = uni.getStorageSync('showcase_favorites')
        if (favorites) {
          this.favoriteProducts = JSON.parse(favorites)
        }
      } catch (e) {
        console.error('加载收藏列表失败:', e)
      }
    },
    saveFavorites() {
      try {
        uni.setStorageSync('showcase_favorites', JSON.stringify(this.favoriteProducts))
      } catch (e) {
        console.error('保存收藏列表失败:', e)
      }
    }
  }
}
</script>

<style scoped>
.showcase-page {
  background: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 140rpx; /* 为底部导航栏留出空间 */
}

/* 现代化头部样式 */
.modern-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20rpx 32rpx 24rpx;
  padding-top: calc(env(safe-area-inset-top) + 20rpx);
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.95;
}

.header-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.title-container {
  position: relative;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.title-decoration {
  position: absolute;
  bottom: -8rpx;
  left: 0;
  width: 60rpx;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2rpx;
}

.favorite-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.favorite-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.favorite-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star-icon {
  font-size: 32rpx;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
}

.favorite-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #ff4757;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #fff;
}

.badge-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 600;
  line-height: 1;
}

.header-search {
  flex: 1;
  max-width: 500rpx;
  margin-left: 32rpx;
}

.modern-search-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  height: 80rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  border: none;
  outline: none;
  background: transparent;
}

.search-input::placeholder {
  color: #999;
}

.search-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.search-icon:active {
  transform: scale(0.95);
  background: rgba(102, 126, 234, 0.2);
}

/* 内容区域 */
.content-wrap {
  padding: 24rpx;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
  transition: all 0.3s ease;
}

.card-hover {
  transform: scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08);
}

.img {
  width: 100%;
  height: 220rpx;
  background: #f5f5f5;
}

.info {
  padding: 12rpx 16rpx 16rpx;
}

.title {
  font-size: 26rpx;
  color: #111;
  font-weight: 600;
  line-height: 1.4;
}

.sub {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #8f8f94;
  line-height: 1.4;
}

.empty-products {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  color: #ccc;
  font-size: 28rpx;
}

/* 收藏夹抽屉样式 */
.favorite-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.favorite-drawer {
  position: fixed;
  top: 0;
  right: -600rpx;
  width: 600rpx;
  height: 100vh;
  background: #fff;
  z-index: 1001;
  transition: right 0.3s ease;
  box-shadow: -4rpx 0 20rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.favorite-drawer--show {
  right: 0;
}

.favorite-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 32rpx 20rpx;
  border-bottom: 1px solid #eee;
  background: #f8f8f8;
}

.favorite-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:active {
  background: #e0e0e0;
  transform: scale(0.95);
}

.close-icon {
  font-size: 36rpx;
  color: #666;
  font-weight: bold;
}

.favorite-content {
  flex: 1;
  padding: 0;
}

.empty-favorites {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  color: #999;
  font-size: 28rpx;
}

.favorite-list {
  padding: 20rpx 0;
}

.favorite-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.3s ease;
}

.favorite-item:active {
  background: #f8f8f8;
}

.favorite-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.favorite-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-right: 16rpx;
}

.favorite-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.remove-favorite {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.remove-favorite:active {
  background: #f8f8f8;
  transform: scale(0.95);
}

.remove-icon {
  font-size: 24rpx;
}
</style>
