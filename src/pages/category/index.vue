<template>
  <view class="category-page">
    <!-- 现代化导航栏 -->
    <view class="modern-header">
      <view class="header-background"></view>
      <view class="header-content">
        <view class="header-left">
          <view class="title-container">
            <text class="page-title">产品分类</text>
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
                placeholder="搜索你想要的商品..."
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

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">正在加载分类数据...</text>
    </view>

    <!-- 主要内容区域 -->
    <view v-else class="content-container">
      <!-- 左侧：主分类列表 -->
      <scroll-view class="left-categories" scroll-y>
        <view
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ 'category-item--active': category.id === activeCategory }"
          @tap="selectMainCategory(category.id)"
        >
          <text class="category-name">{{ category.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧：子分类和商品展示 -->
      <view class="right-content">
        <!-- 子分类标签栏 -->
        <view v-if="currentCategoryData?.children?.length && !isSearchMode" class="subcategory-tabs">
          <scroll-view class="tabs-scroll" scroll-x>
            <view class="tabs-container">
              <text
                v-for="sub in currentCategoryData.children"
                :key="sub.id"
                class="tab-item"
                :class="{ 'tab-item--active': sub.id === activeSubcategory }"
                @tap="scrollToSubcategory(sub.id)"
              >
                {{ sub.name }}
              </text>
            </view>
          </scroll-view>
        </view>

        <!-- 商品展示区域 -->
        <scroll-view 
          class="products-container" 
          scroll-y 
          :scroll-into-view="scrollTarget"
          :scroll-with-animation="false"
          enable-flex
          enhanced
          @scroll="onScroll"
        >
          <!-- 搜索模式 -->
          <view v-if="isSearchMode" class="search-results-section">
            <view class="section-title">
              <text class="title-text">搜索结果</text>
              <text class="product-count">({{ searchResults.length }}个商品)</text>
            </view>
            <ProductGrid 
              v-if="searchResults.length" 
              :products="searchResults" 
              @select="onProductSelect" 
            />
            <view v-else class="empty-products">
              <text class="empty-text">未找到相关商品</text>
            </view>
          </view>
          
          <!-- 正常分类模式：显示当前分类下的所有子分类和商品 -->
          <view v-else-if="currentCategoryData" class="category-content">
            <view 
              v-for="subcategory in currentCategoryData.children" 
              :key="subcategory.id" 
              class="subcategory-section"
              :id="'subcategory-' + subcategory.id"
            >
              <view class="section-title">
                <view class="title-content-wrapper">
                  <text class="title-text">{{ subcategory.name }}</text>
                  <text class="product-count">({{ subcategory.products?.length || 0 }}个商品)</text>
                </view>
              </view>
              <ProductGrid 
                v-if="subcategory.products?.length" 
                :products="subcategory.products" 
                @select="onProductSelect" 
              />
              <view v-else class="empty-products">
                <text class="empty-text">暂无商品</text>
              </view>
            </view>
          </view>
        </scroll-view>

      </view>
    </view>

    <!-- 商品详情弹窗 -->
    <ProductDetailDrawer 
      v-model="showProductDetail" 
      :product="selectedProduct" 
      :images="selectedProduct?.images || []"
      @share="onProductShare"
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
          <text class="empty-text">暂无收藏商品</text>
        </view>
        <view v-else class="favorite-list">
          <view 
            v-for="product in favoriteProducts" 
            :key="product.id" 
            class="favorite-item"
            @tap="onFavoriteProductSelect(product)"
          >
            <image class="favorite-image" :src="product.image" mode="aspectFill" />
            <view class="favorite-info">
              <text class="favorite-name">{{ product.name }}</text>
              <text class="favorite-desc">{{ product.description || product.sub || '暂无描述' }}</text>
            </view>
            <view class="remove-favorite" @tap.stop="removeFavorite(product)">
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
import { fetchCategories } from './data-mock.js'
import ProductGrid from '../../components/ProductGrid.vue'
import ProductDetailDrawer from '../../components/ProductDetailDrawer.vue'
import CustomTabBar from '../../components/CustomTabBar.vue'

export default {
  name: 'CategoryPage',
  components: {
    ProductGrid,
    ProductDetailDrawer,
    CustomTabBar
  },
  data() {
    return {
      loading: true,
      categories: [],
      activeCategory: null,
      activeSubcategory: null,
      scrollTarget: '',
      
      // 搜索相关
      searchKeyword: '',
      isSearchMode: false,
      searchResults: [],
      
      // 商品详情相关
      showProductDetail: false,
      selectedProduct: null,
      
      // 收藏夹相关
      showFavorites: false,
      favoriteProducts: [],
      
      // 滚动相关
      isScrollingToTarget: false,
      scrollTimer: null
    }
  },
  computed: {
    // 当前主分类数据
    currentCategoryData() {
      return this.categories.find(cat => cat.id === this.activeCategory) || null
    }
  },
  async created() {
    // 先读本地缓存，提升首屏速度
    this.loadCategoriesFromCache()
    // 后台刷新最新数据
    this.refreshCategories()
    this.loadFavorites()
  },
  methods: {
    // 从本地缓存加载分类数据（若有），快速首屏
    loadCategoriesFromCache() {
      try {
        const cache = uni.getStorageSync('categoriesCache')
        if (cache && Array.isArray(cache.data)) {
          this.categories = cache.data
          // 默认选中第一个主分类和第一个子分类
          if (cache.data.length > 0) {
            this.activeCategory = cache.data[0].id
            if (cache.data[0].children?.length > 0) {
              this.activeSubcategory = cache.data[0].children[0].id
            }
          }
          this.loading = false
        }
      } catch (e) {
        // 忽略缓存异常
      }
    },

    // 刷新分类数据并写入缓存
    async refreshCategories() {
      try {
        const data = await fetchCategories()
        this.categories = data
        // 默认选中第一个主分类和第一个子分类
        if (data.length > 0) {
          this.activeCategory = data[0].id
          if (data[0].children?.length > 0) {
            this.activeSubcategory = data[0].children[0].id
          }
        }
        // 写入本地缓存
        uni.setStorageSync('categoriesCache', { data, time: Date.now() })
      } catch (error) {
        console.error('刷新分类数据失败:', error)
        if (this.categories.length === 0) {
          uni.showToast({ title: '加载失败，请重试', icon: 'none' })
        }
      } finally {
        this.loading = false
      }
    },
    
    // 选择主分类
    selectMainCategory(categoryId) {
      if (this.activeCategory === categoryId) return
      
      this.activeCategory = categoryId
      
      // 退出搜索模式
      this.isSearchMode = false
      this.searchKeyword = ''
      this.searchResults = []
      
      // 自动选中该分类下的第一个子分类
      const category = this.categories.find(cat => cat.id === categoryId)
      if (category?.children?.length > 0) {
        this.activeSubcategory = category.children[0].id
      } else {
        this.activeSubcategory = ''
      }
      
      // 重置滚动位置
      this.scrollTarget = ''
    },
    
    // 点击 chip 滚动到对应子分类
    scrollToSubcategory(subcategoryId) {
      this.activeSubcategory = subcategoryId
      this.isScrollingToTarget = true
      
      // 先清空再设置，确保触发滚动
      this.scrollTarget = ''
      this.$nextTick(() => {
        this.scrollTarget = `subcategory-${subcategoryId}`
        
        // 动画已禁用，延时也相应缩短
        setTimeout(() => {
          this.isScrollingToTarget = false
        }, 50)
      })
    },
    
    // 滚动监听，用于更新当前高亮的 chip
    onScroll(e) {
      if (this.isScrollingToTarget) return // 程序化滚动时不更新高亮
      if (this.isSearchMode) return // 搜索模式下不处理
      if (!this.currentCategoryData?.children?.length) return
      
      // 防抖处理
      if (this.scrollTimer) {
        clearTimeout(this.scrollTimer)
      }
      
      this.scrollTimer = setTimeout(() => {
        this.updateActiveSubcategoryByScroll()
      }, 100)
    },
    
    // 根据滚动位置更新当前高亮的子分类
    updateActiveSubcategoryByScroll() {
      if (!this.currentCategoryData?.children?.length) return
      
      const query = uni.createSelectorQuery().in(this)
      
      // 获取滚动容器的位置信息
      query.select('.products-container').boundingClientRect(containerRect => {
        if (!containerRect) return
        
        const visibleTitles = []
        const containerTop = containerRect.top
        const containerBottom = containerRect.bottom
        
        // 遍历所有子分类，检查其标题是否在可视区域内
        this.currentCategoryData.children.forEach(subcategory => {
          // 查询分类标题的位置（而不是整个区域）
          query.select(`#subcategory-${subcategory.id} .section-title`).boundingClientRect(titleRect => {
            if (titleRect) {
              const titleTop = titleRect.top
              const titleBottom = titleRect.bottom
              
              // 判断标题是否在可视区域内（完全或部分可见）
              if (titleBottom > containerTop && titleTop < containerBottom) {
                visibleTitles.push({
                  id: subcategory.id,
                  top: titleTop,
                  bottom: titleBottom,
                  // 计算标题在容器中的相对位置（越大表示越靠下）
                  relativePosition: titleTop - containerTop
                })
              }
            }
          })
        })
        
        // 执行查询
        query.exec(() => {
          if (visibleTitles.length > 0) {
            // 业内最佳实践：当有多个标题可见时，选择靠下（relativePosition最大）的那个
            // 但如果标题已经完全滑出顶部，则选择最接近顶部的那个
            let targetSubcategory = null
            
            // 过滤出在可视区域内的标题
            const fullyVisibleTitles = visibleTitles.filter(title => 
              title.top >= containerTop && title.bottom <= containerBottom
            )
            
            if (fullyVisibleTitles.length > 0) {
              // 如果有完全可见的标题，选择最靠下的那个
              targetSubcategory = fullyVisibleTitles.reduce((prev, current) => 
                current.relativePosition > prev.relativePosition ? current : prev
              )
            } else {
              // 如果没有完全可见的标题，选择部分可见且最靠下的那个
              targetSubcategory = visibleTitles.reduce((prev, current) => 
                current.relativePosition > prev.relativePosition ? current : prev
              )
            }
            
            if (targetSubcategory && targetSubcategory.id !== this.activeSubcategory) {
              this.activeSubcategory = targetSubcategory.id
            }
          }
        })
      })
      
      query.exec()
    },
    
    // 选择商品
    onProductSelect(product) {
      this.selectedProduct = product
      this.showProductDetail = true
    },
    
    // 商品分享
    onProductShare(product) {
      uni.showToast({
        title: `分享商品：${product?.name || ''}`,
        icon: 'success'
      })
    },
    
    // 商品收藏
    onProductFavorite(product) {
      // 检查是否已经收藏
      const existIndex = this.favoriteProducts.findIndex(item => item.id === product.id)
      if (existIndex === -1) {
        // 添加到收藏列表
        this.favoriteProducts.push({
          ...product,
          favoriteTime: Date.now()
        })
        // 保存到本地存储
        uni.setStorageSync('favoriteProducts', this.favoriteProducts)
      }
    },
    

    
    // 搜索输入处理
    onSearchInput(e) {
      const keyword = e.detail.value.trim()
      this.searchKeyword = keyword
      
      if (keyword === '') {
        this.isSearchMode = false
        this.searchResults = []
        return
      }
      
      // 实时搜索（可以添加防抖优化）
      this.performSearch(keyword)
    },
    
    // 搜索确认
    onSearchConfirm() {
      if (this.searchKeyword.trim()) {
        this.performSearch(this.searchKeyword.trim())
      }
    },
    
    // 执行搜索
    performSearch(keyword) {
      this.isSearchMode = true
      const results = []
      
      // 遍历所有分类和子分类，搜索匹配的商品
      this.categories.forEach(category => {
        category.children?.forEach(subcategory => {
          subcategory.products?.forEach(product => {
            if (product.name.toLowerCase().includes(keyword.toLowerCase())) {
              results.push({
                ...product,
                categoryName: category.name,
                subcategoryName: subcategory.name
              })
            }
          })
        })
      })
      
      this.searchResults = results
    },
    
    // 显示收藏夹抽屉
    showFavoriteDrawer() {
      this.showFavorites = true
    },
    
    // 隐藏收藏夹抽屉
    hideFavoriteDrawer() {
      this.showFavorites = false
    },
    
    // 点击收藏夹中的商品
    onFavoriteProductSelect(product) {
      this.selectedProduct = product
      this.showProductDetail = true
      // 不关闭收藏夹，这样关闭详情页后可以返回收藏夹
    },
    
    // 从收藏夹移除商品
    removeFavorite(product) {
      const index = this.favoriteProducts.findIndex(item => item.id === product.id)
      if (index !== -1) {
        this.favoriteProducts.splice(index, 1)
        // 更新本地存储
        uni.setStorageSync('favoriteProducts', this.favoriteProducts)
        uni.showToast({
          title: '已取消收藏',
          icon: 'success'
        })
      }
    },
    
    // 加载收藏数据
    loadFavorites() {
      try {
        const favorites = uni.getStorageSync('favoriteProducts')
        if (favorites && Array.isArray(favorites)) {
          this.favoriteProducts = favorites
        }
      } catch (e) {
        console.error('加载收藏数据失败:', e)
      }
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.category-page {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 阻止页面级别滚动 */
  /* padding-bottom: 140rpx;  移除此行，因为 CustomTabBar 是固定定位 */
}

/* 现代化导航栏 */
.modern-header {
  position: relative;
  padding: 20rpx 32rpx 24rpx;
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
  -webkit-backdrop-filter: blur(10px);
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
  gap: 20rpx;
}

.title-container {
  position: relative;
}

.page-title {
  font-size: 38rpx;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
  letter-spacing: 1rpx;
}

.title-decoration {
  position: absolute;
  bottom: -6rpx;
  left: 0;
  width: 60%;
  height: 4rpx;
  background: linear-gradient(90deg, #fff 0%, transparent 100%);
  border-radius: 2rpx;
}

.favorite-btn {
  position: relative;
}

.favorite-icon-wrapper {
  position: relative;
  width: 68rpx;
  height: 68rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.favorite-icon-wrapper:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
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
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.4);
}

.badge-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 600;
  line-height: 1;
}

/* 现代化搜索框 */
.header-search {
  flex: 1;
  max-width: 420rpx;
  margin-left: 32rpx;
}

.modern-search-box {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  transform: translateY(-4rpx);
}

/* 加载状态 */
.loading-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: #999;
  font-size: 28rpx;
}

/* 主要内容区域 */
.content-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧主分类列表 */
.left-categories {
  width: 200rpx;
  background: #fff;
  border-right: 1px solid #eee;
}

.category-item {
  padding: 32rpx 24rpx;
  border-bottom: 1px solid #f5f5f5;
  text-align: center;
  transition: all 0.3s ease;
}

.category-item--active {
  background: #fff2e8;
  border-right: 4rpx solid #ff6600;
}

.category-name {
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
}

.category-item--active .category-name {
  color: #ff6600;
  font-weight: 600;
}

/* 右侧内容区域 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.search-input {
  flex: 1;
  padding: 18rpx 24rpx;
  padding-right: 80rpx;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
  font-weight: 400;
}

.search-input::placeholder {
  color: #999;
  font-weight: 300;
}

.search-icon {
  position: absolute;
  right: 24rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-icon:active {
  transform: scale(0.95);
  background: rgba(102, 126, 234, 0.2);
}



/* 子分类标签栏 */
.subcategory-tabs {
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 20rpx 0;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-container {
  display: inline-flex;
  padding: 0 32rpx;
}

.tab-item {
  display: inline-block;
  padding: 16rpx 32rpx;
  margin-right: 24rpx;
  font-size: 28rpx;
  color: #666;
  background: #f8f8f8;
  border-radius: 32rpx;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-item--active {
  background: #ff6600;
  color: #fff;
}

/* 商品展示区域 */
.products-container {
  flex: 1;
  height: 0; /* 关键：设置高度为0，让flex生效 */
  box-sizing: border-box;
}

.search-results-section,
.category-content {
  padding: 24rpx 32rpx; /* 将内边距下放到这里 */
}

.category-content {
  min-height: 100%;
}

.subcategory-section {
  margin-bottom: 48rpx;
}

.section-title {
  /* 外层容器负责定位和背景 */
  position: sticky;
  top: -4rpx; /* 设置负值，让其位置上移，覆盖掉自身的边框，实现更紧密的吸顶效果 */
  z-index: 10;
  background-color: #fff; 
  width: auto; /* 宽度自适应，配合负边距使用 */
  border-bottom: 2rpx solid #f0f0f0;
  
  /* --- 核心代码：利用负边距让其宽度超越父容器 --- */
  margin-left: -32rpx;
  margin-right: -32rpx;
}

.title-content-wrapper {
  /* 内层容器负责内容布局和内边距 */
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx; /* 补偿负边距，让文字内容对齐 */
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-right: 16rpx;
}

.product-count {
  font-size: 24rpx;
  color: #999;
}

/* 空状态 */
.empty-products {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
}

.empty-text {
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
  cursor: pointer;
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
  cursor: pointer;
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
  cursor: pointer;
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
