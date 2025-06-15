<template>
  <div class="home-container">
    <!-- 轮播图 -->
    <div class="carousel-wrapper">
      <div class="carousel">
        <img 
          v-for="(img, i) in carouselImages"
          :key="i"
          :src="img"
          :class="{ active: current === i }"
          alt="药材展示"
        >
      </div>
      <!-- 轮播指示器 -->
      <div class="carousel-indicators">
        <span 
          v-for="(_, index) in carouselImages"
          :key="index"
          :class="{ active: current === index }"
          @click="current = index"
        ></span>
      </div>
    </div>

    <!-- 搜索区域 -->
    <section class="search-section">
      <!-- 原有搜索框 -->
      <div class="search-container">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="输入药材名称、功效或拉丁名"
            @input="handleSearch"
            class="search-input"
          >
        </div>
        
        <!-- 搜索结果 -->
        <transition name="fade">
          <div 
            v-if="searchQuery"
            class="search-results-card"
          >
            <div v-if="searchResults.length > 0" class="results-list">
              <div
                v-for="herb in searchResults"
                :key="herb.id"
                class="result-item"
                @click="goToDetail(herb.id)"
              >
                <img 
                  v-if="herb.images.length > 0"
                  :src="herb.images[0]"
                  class="herb-thumbnail"
                >
                <div class="herb-info">
                  <h3 class="herb-name">{{ herb.name }}</h3>
                  <p class="herb-latin">{{ herb.latinName }}</p>
                  <div class="herb-tags">
                    <span 
                      v-for="(effect, index) in getPreviewEffects(herb.effects, 2)" 
                      :key="index"
                      class="tag"
                    >
                      {{ effect }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <img src="@/assets/no-results.svg" class="empty-icon">
              <p>没有找到相关药材，请尝试其他关键词</p>
            </div>
          </div>
        </transition>
      </div>
    </section>

    <!-- 导航区块 -->
    <section class="features-section">
      <h2 class="section-title">探索农大的药用植物</h2>
      <div class="feature-grid">
        <router-link 
          to="/category/plant-type" 
          class="feature-card plant-type"
        >
          <div class="card-content">
            <div class="icon-wrapper">
              <svg class="feature-icon" viewBox="0 0 24 24">
                <path d="M12 22c4.56 0 8.33-3.4 8.92-7.8.09-.64-.48-1.21-1.12-1.12-4.4.59-7.8 4.36-7.8 8.92 0 .55.45 1 1 1zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-.53-.16-1.01-.44-1.42l.19.02c0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 5.12 13.38 4 12 4S9.5 5.12 9.5 6.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 .53.16 1.01.44 1.42l-.19-.02z"/>
              </svg>
            </div>
            <h3>按种类浏览</h3>
            <p>草本植物、矿物药材、动物药材等分类</p>
          </div>
        </router-link>

        <router-link 
          to="/category/medicinal" 
          class="feature-card medicinal"
        >
          <div class="card-content">
            <div class="icon-wrapper">
              <svg class="feature-icon" viewBox="0 0 24 24">
                <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </div>
            <h3>按功效检索</h3>
            <p>清热解毒、活血化瘀等功效分类</p>
          </div>
        </router-link>

        <router-link 
          to="/location-map" 
          class="feature-card location"
        >
          <div class="card-content">
            <div class="icon-wrapper">
              <svg class="feature-icon" viewBox="0 0 24 24">
                <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
              </svg>
            </div>
            <h3>按地点浏览</h3>
            <p>教学楼、食堂、图书馆附近等地点</p>
          </div>
        </router-link>
      </div>
    </section>

    <!-- 附加内容区块 -->
    <section class="additional-section">
      <div class="info-card">
        <h3>热门药材推荐</h3>
        <!-- 热门药材推荐部分 -->
          <div class="hot-herbs">
            <div 
              v-for="herb in featuredHerbs"
              :key="herb.id"
              class="hot-item"
              @click="goToDetail(herb.id)"
            >
              <img :src="herb.images[0]" alt="热门药材">
              <span>{{ herb.name }}</span>
              <!-- 功效标签 -->
              <div class="hot-tags">
                <span
                  v-for="(effect, idx) in getPreviewEffects(herb.effects, 1)"
                  :key="idx"
                  class="mini-tag"
                >
                  {{ effect }}
                </span>
              </div>
            </div>
          </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import herbs from '@/data/herbs.json'

const router = useRouter()
const current = ref(0)
const searchQuery = ref('')
const carouselImages = [
  '/images/carousel-1.jpg',
  '/images/carousel-2.jpg',
  '/images/carousel-3.jpg',
  '/images/carousel-4.jpg'
]

// 类型判断方法
const isObject = (value) => {
  return value && typeof value === 'object' && !Array.isArray(value)
}

onMounted(() => {
  setInterval(() => {
    current.value = (current.value + 1) % carouselImages.length
  }, 5000)
})
// 统一的效果处理方法
const getPreviewEffects = (effects, max = 3) => {
  try {
    // 处理不同类型的数据
    const effectList = Array.isArray(effects) 
      ? effects 
      : isObject(effects)
        ? Object.values(effects).flatMap(v => 
            Array.isArray(v) ? v : [v]
          )
        : typeof effects === 'string'
          ? [effects]
          : []

    // 过滤空值并截取
    return effectList
      .filter(e => typeof e === 'string' && e.trim())
      .slice(0, max)
  } catch {
    return []
  }
}

// 搜索逻辑
const handleSearch = _.debounce(() => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
  }
}, 300)

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  
  const query = searchQuery.value.toLowerCase()
  return herbs.filter(herb => {
    // 统一处理别名搜索
    const aliases = Array.isArray(herb.aliases) 
      ? herb.aliases 
      : isObject(herb.aliases) 
        ? Object.values(herb.aliases).flat()
        : []

    // 统一处理功效搜索
    const effects = Array.isArray(herb.effects) 
      ? herb.effects 
      : isObject(herb.effects) 
        ? Object.values(herb.effects).flat()
        : []

    return (
      (herb.name && herb.name.toLowerCase().includes(query)) ||
      (herb.latinName && herb.latinName.toLowerCase().includes(query)) ||
      aliases.some(alias => alias.toLowerCase().includes(query)) ||
      effects.some(effect => effect.toLowerCase().includes(query))
    )
  })
})

const featuredHerbs = computed(() => {
  // 完全随机选择5个药材
  return [...herbs].sort(() => 0.5 - Math.random()).slice(0, 5)
})

const goToDetail = (id) => {
  searchQuery.value = ''
  router.push(`/detail/${id}`)
}
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 20px auto;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* 轮播图 */
.carousel-wrapper {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  margin: 20px 0 30px;
  border: 5px solid #fff;
}

.carousel {
  height: 500px;
  position: relative;
}

.carousel img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  filter: brightness(0.85);
}

.carousel img.active {
  opacity: 1;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.carousel-indicators span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.carousel-indicators span.active {
  background: #fff;
  transform: scale(1.2);
}

/* 搜索区域 */
.search-section {
  padding: 40px 0;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.search-box {
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  background: #fff;
  padding: 8px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  fill: #4CAF50;
}

.search-input {
  width: 100%;
  padding: 18px 30px 18px 60px;
  font-size: 18px;
  border: none;
  border-radius: 50px;
  outline: none;
  transition: all 0.3s;
  background: transparent;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.search-results-card {
  margin-top: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.results-list {
  max-height: 500px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #eee;
}

.result-item:hover {
  background: #f8f8f8;
  transform: translateY(-2px);
}

.herb-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.herb-info {
  flex: 1;
}

.herb-name {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.herb-latin {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.herb-tags {
  display: flex;
  gap: 8px;
}

.tag {
  background: #e8f5e9;
  color: #4CAF50;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.empty-state {
  padding: 40px;
  text-align: center;
}

.empty-icon {
  width: 120px;
  opacity: 0.6;
  margin-bottom: 20px;
}

/* 特色功能区块 */
.features-section {
  padding: 40px 0 60px;
}

.section-title {
  text-align: center;
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 40px;
  position: relative;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: rgba(76, 175, 80, 0.5);
  border-radius: 3px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  transition: all 0.3s;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
  position: relative;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.feature-card.plant-type {
  background: linear-gradient(135deg, rgba(232, 245, 233, 0.9), rgba(200, 230, 201, 0.9));
}

.feature-card.medicinal {
  background: linear-gradient(135deg, rgba(251, 233, 231, 0.9), rgba(255, 204, 188, 0.9));
}

.feature-card.location {
  background: linear-gradient(135deg, rgba(232, 245, 233, 0.9), rgba(200, 230, 201, 0.9));
}

.icon-wrapper {
  background: rgba(255, 255, 255, 0.3);
  width: 70px;
  height: 70px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 36px;
  height: 36px;
  fill: #4CAF50;
}

.feature-card h3 {
  margin: 0 0 12px;
  color: #2c3e50;
  font-size: 22px;
}

.feature-card p {
  color: #555;
  line-height: 1.6;
  font-size: 16px;
}

/* 热门药材区块 */
.additional-section {
  padding: 20px 0 40px;
}

.info-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.info-card h3 {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 25px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(76, 175, 80, 0.3);
}

.hot-herbs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.hot-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.hot-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.hot-item img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s;
}

.hot-item:hover img {
  transform: scale(1.05);
}

.hot-item span {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
  padding: 12px;
  font-weight: 500;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .home-container {
    padding: 15px;
    margin: 10px;
  }
  
  .carousel {
    height: 300px;
  }

  .search-input {
    padding: 14px 20px 14px 50px;
    font-size: 16px;
  }

  .section-title {
    font-size: 24px;
  }

  .feature-grid {
    gap: 20px;
  }

  .feature-card {
    padding: 20px;
  }
  
  .hot-herbs {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 15px;
  }
  
  .hot-item img {
    height: 140px;
  }
}

.mini-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #4CAF50;
  font-weight: 500;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
</style>