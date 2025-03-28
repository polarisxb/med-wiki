<template>
  <div class="home-container">
    <!-- 轮播图优化 -->
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
      <h2 class="section-title">探索中药材世界</h2>
      <div class="feature-grid">
        <router-link 
          to="/category/plant-type" 
          class="feature-card plant-type"
        >
          <div class="card-content">
            <div class="icon-wrapper">
              <svg class="feature-icon" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
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
                <path d="M21 9c-1.1 0-2 .9-2 2v4H5v-4c0-1.1-.9-2-2-2s-2 .9-2 2v5c0 1.65 1.35 3 3 3h16c1.65 0 3-1.35 3-3v-5c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <h3>按功效检索</h3>
            <p>清热解毒、活血化瘀等功效分类</p>
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
  return herbs.slice(0, 5)
})

const goToDetail = (id) => {
  searchQuery.value = ''
  router.push(`/detail/${id}`)
}
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 轮播图 */
.carousel-wrapper {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  margin: 20px 0;
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
  filter: brightness(0.8);
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
}

.carousel-indicators span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.3s;
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
}

.search-box {
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 50px;
  background: #fff;
  padding: 8px;
}

.search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  fill: #666;
}

.search-input {
  width: 100%;
  padding: 18px 30px 18px 60px;
  font-size: 18px;
  border: none;
  border-radius: 50px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.search-results-card {
  margin-top: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  overflow: hidden;
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
}

.herb-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
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
  padding: 60px 0;
}

.section-title {
  text-align: center;
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 40px;
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.feature-card.plant-type {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
}

.feature-card.medicinal {
  background: linear-gradient(135deg, #fbe9e7, #ffccbc);
}

.icon-wrapper {
  background: rgba(255,255,255,0.2);
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.feature-icon {
  width: 32px;
  height: 32px;
  fill: #4CAF50;
}

.feature-card h3 {
  margin: 0 0 12px;
  color: #2c3e50;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* 热门药材区块 */
.additional-section {
  padding: 40px 0;
}

.info-card {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
}

.hot-item:hover {
  transform: translateY(-5px);
}

.hot-item img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.hot-item span {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
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
}
.mini-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(255,255,255,0.9);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>