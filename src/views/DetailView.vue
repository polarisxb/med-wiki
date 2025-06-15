<template>
  <div v-if="herb" class="detail-container">
    <!-- 头部信息 -->
    <header class="herb-header">
      <h1 class="chinese-name">{{ herb.name }}</h1>
      <p class="scientific-name">
        <template v-if="isObject(herb.scientificName)">
          <span v-for="(value, key) in herb.scientificName" :key="key">
            {{ key }}：<i>{{ value }}</i><br>
          </span>
        </template>
        <template v-else>
          <i>{{ herb.scientificName }}</i>
        </template>
      </p>
      <p class="english-name">
        <template v-if="isObject(herb.englishName)">
          {{ Object.values(herb.englishName).join(' / ') }}
        </template>
        <template v-else>
          {{ herb.englishName }}
        </template>
      </p>
    </header>

    <!-- 图片展示 -->
    <section class="image-gallery">
      <div class="gallery-container">
        <!-- 图片卡片 -->
        <div 
          v-for="(img, index) in herb.images" 
          :key="index" 
          class="gallery-card image-card"
          @click="openLightbox(index)"
        >
          <div class="card-content">
            <img
              :src="resolveImage(img)"
              :alt="herb.name"
              class="herb-image"
              @error="handleImageError"
              @load="onImageLoad"
            >
            <div class="image-overlay">
              <span class="zoom-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
        
        <!-- 位置信息卡片 -->
        <div v-if="herb.location" class="gallery-card location-card">
          <div class="card-content">
            <h3 class="location-title">
              <i class="fas fa-map-marker-alt location-icon"></i>
              药材位置信息
            </h3>
            <div class="location-content">
              <!-- 如果 location 是一个数组，则遍历显示每条信息 -->
              <template v-if="Array.isArray(herb.location)">
                <p v-for="(loc, idx) in herb.location" :key="idx" class="location-text">{{ loc }}</p>
              </template>
              <!-- 否则，直接显示 location 字符串 -->
              <template v-else>
                <p class="location-text">{{ herb.location }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 图片查看器 -->
    <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">&times;</button>
        <button v-if="currentImageIndex > 0" class="lightbox-nav lightbox-prev" @click="prevImage">&lsaquo;</button>
        <img
          :src="resolveImage(herb.images[currentImageIndex])"
          :alt="herb.name"
          class="lightbox-image"
          @error="handleImageError"
        >
        <button v-if="currentImageIndex < herb.images.length - 1" class="lightbox-nav lightbox-next" @click="nextImage">&rsaquo;</button>
        <div class="lightbox-counter">{{ currentImageIndex + 1 }} / {{ herb.images.length }}</div>
      </div>
    </div>



    <!-- 主要信息区域 -->
    <main class="info-sections-wrapper">
      <!-- 基本信息 -->
      <section class="info-block basic-info">
        <h2 class="info-title">
          <i class="fas fa-info-circle info-icon"></i>
          基本信息
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">拼音：</span>
            <span class="info-content">{{ herb.pinyin }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">别名：</span>
            <span class="info-content">{{ formatAliases(herb.aliases) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">分类：</span>
            <span class="info-content">{{ formatArray(herb.category) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">科属：</span>
            <span class="info-content">{{ formatObject(herb.spieces) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">贮藏：</span>
            <span class="info-content">{{ formatStorage(herb.storage) }}</span>
          </div>
        </div>
      </section>

      <!-- 形态特征 -->
      <section class="info-block description-info">
        <h2 class="info-title">
          <i class="fas fa-leaf info-icon"></i>
          形态特征
        </h2>
        <div class="description-text">
          <template v-if="isObject(herb.description)">
            <div v-for="(desc, key) in herb.description" :key="key" class="description-item">
              <strong class="variant-title">{{ key }}：</strong>
              <p class="variant-content">{{ desc }}</p>
            </div>
          </template>
          <template v-else>
            <p class="description-content">{{ herb.description }}</p>
          </template>
        </div>
      </section>

      <!-- 药用信息 -->
      <section class="info-block medical-info">
        <h2 class="info-title">
          <i class="fas fa-pills info-icon"></i>
          药用信息
        </h2>
        <div class="medical-grid">
          <div class="effects">
            <h3 class="sub-title">主要功效</h3>
            <div class="effects-content">
              <template v-if="isObject(herb.effects)">
                <div v-for="(effects, key) in herb.effects" :key="key" class="effect-group">
                  <strong class="effect-type">{{ key }}：</strong>
                  <ul class="effect-list">
                    <li v-for="(effect, idx) in effects" :key="idx" class="effect-item">
                      <i class="fas fa-check-circle effect-icon"></i>{{ effect }}
                    </li>
                  </ul>
                </div>
              </template>
              <template v-else>
                <div class="effect-group">
                  <ul class="effect-list">
                    <li v-for="(effect, idx) in herb.effects" :key="idx" class="effect-item">
                      <i class="fas fa-check-circle effect-icon"></i>{{ effect }}
                    </li>
                  </ul>
                </div>
              </template>
            </div>
          </div>

          <div class="functions">
            <h3 class="sub-title">主治功能</h3>
            <div class="functions-content">
              <template v-if="isObject(herb.functions)">
                <div v-for="(func, key) in herb.functions" :key="key" class="function-group">
                  <strong class="function-type">{{ key }}：</strong>
                  <p class="function-desc">{{ func }}</p>
                </div>
              </template>
              <template v-else>
                <div class="function-group">
                  <p class="function-desc">{{ herb.functions }}</p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </section>

      <!-- 用法用量 -->
      <section class="info-block dosage-info">
        <h2 class="info-title">
          <i class="fas fa-prescription-bottle-alt info-icon"></i>
          用法用量
        </h2>
        <pre class="dosage-text">{{ formatDosage(herb.dosage) }}</pre>
      </section>

      <!-- 注意事项 -->
      <section class="info-block precautions-info">
        <h2 class="info-title">
          <i class="fas fa-exclamation-triangle info-icon warning-icon"></i>
          注意事项
        </h2>
        <div class="warning-content">
          <template v-if="isObject(herb.precautions)">
            <div v-for="(items, key) in herb.precautions" :key="key" class="warning-group">
              <strong class="warning-type">{{ key }}：</strong>
              <ul class="warning-list">
                <li v-for="(item, idx) in items" :key="idx" class="warning-item">
                  <i class="fas fa-hand-point-right warning-item-icon"></i>{{ item }}
                </li>
              </ul>
            </div>
          </template>
          <template v-else>
            <p class="warning-text">{{ herb.precautions }}</p>
          </template>
        </div>
      </section>


    </main>

    <router-link to="/" class="back-button">
      <i class="fas fa-arrow-left"></i> 返回首页
    </router-link>
  </div>

  <!-- 加载状态 -->
  <div v-else class="loading-state">
    <div v-if="!errorMsg" class="loading">
      <span class="loader"></span>
      <p class="loading-text">药材信息加载中...</p>
    </div>
    <div v-else class="error-message">
      <p class="error-text">{{ errorMsg }}</p>
      <router-link to="/" class="error-link">
        <i class="fas fa-home"></i>返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import herbsData from '@/data/herbs.json'

const route = useRoute()
const herb = ref(null)
const errorMsg = ref('')
const lightboxOpen = ref(false)
const currentImageIndex = ref(0)
const imagesLoaded = ref(0)

// 类型检测方法
const isObject = (value) => {
  return value && typeof value === 'object' && !Array.isArray(value)
}

// 格式化方法
const formatAliases = (aliases) => {
  if (Array.isArray(aliases)) return aliases.join('，')
  if (isObject(aliases)) return Object.values(aliases).flat().join('，')
  return ''
}

const formatArray = (arr) => {
  return Array.isArray(arr) ? arr.join('，') : ''
}

const formatObject = (obj) => {
  return isObject(obj) ? Object.values(obj).join('；') : obj
}

const formatStorage = (storage) => {
  if (Array.isArray(storage)) return storage.join('；')
  if (isObject(storage)) return Object.entries(storage).map(([k, v]) => `${k}：${v}`).join('；')
  return storage
}

const formatDosage = (dosage) => {
  if (Array.isArray(dosage)) return dosage.join('\n')
  if (isObject(dosage)) return Object.entries(dosage).map(([k, v]) => `${k}：${v}`).join('\n')
  return dosage
}

// 图片处理
const defaultImage = `${process.env.BASE_URL}images/default-herb.jpg`

const resolveImage = (imgPath) => {
  try {
    if (imgPath.startsWith('//')) return `https:${imgPath}`
    if (imgPath.startsWith('/images/')) return `${process.env.BASE_URL}${imgPath.slice(1)}`
    return new URL(`../assets${imgPath}`, import.meta.url).href
  } catch (err) {
    console.error('图片加载失败:', err)
    return defaultImage
  }
}

const handleImageError = (e) => {
  e.target.src = defaultImage
}

// 图片加载完成处理
const onImageLoad = () => {
  imagesLoaded.value++
}

// 灯箱功能
const openLightbox = (index) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
  // 阻止页面滚动
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxOpen.value = false
  // 恢复页面滚动
  document.body.style.overflow = ''
}

const nextImage = () => {
  if (currentImageIndex.value < herb.value.images.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

// 初始化加载
onMounted(() => {
  try {
    const targetId = route.params.id.toLowerCase().trim()
    herb.value = herbsData.find(item =>
        item.id?.toLowerCase()?.trim() === targetId
    )

    if (!herb.value) {
      throw new Error(`未找到ID为 "${route.params.id}" 的药材`)
    }
    
    // 图片加载后重新计算布局
    window.addEventListener('resize', resizeAllMasonryItems)
  } catch (err) {
    errorMsg.value = `数据加载失败: ${err.message}`
    console.error('完整错误信息:', err)
  }
})

// 窗口大小变化时的处理函数
const resizeAllMasonryItems = () => {
  // 这个版本不需要动态调整高度
}
</script>

<style scoped>
/* 引入 Google Fonts - 推荐在 index.html 或 main.js 中全局引入 */
/* @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Inter:wght@400;600;700&display=swap'); */

/* --- 全局样式变量 --- */
:root {
  --primary-green: #28a745; /* 核心绿色 */
  --secondary-brown: #8B4513; /* 泥土棕色 */
  --page-bg: #e8f5e9; /* 整个页面的背景色，调整为淡绿色 */
  --light-bg: #dcedc8; /* 内容容器的背景色，调整为稍深的淡绿色 */
  --block-bg: #ffffff; /* 信息区块背景保持白色，形成对比 */
  --border-color-main: #9cb89c; /* 调整：主边框颜色，更深的柔和绿色 */
  --border-color-subtle: #c0c0b8; /* 浅灰色边框 (用于内部元素) */
  --dark-text: #2c2c2c; /* 更深的文本色 */
  --medium-text: #4a4a4a; /* 中等文本色 */
  --light-grey-border: #d0d0d0; /* 浅灰色边框 (用于内部元素) */
  --accent-blue: #0069d9; /* 强调蓝色，稍微深一点 */
  --warning-red: #c82333; /* 警告红色，稍微深一点 */
  --warning-yellow: #e0a800; /* 警告黄色，稍微深一点 */
  --box-shadow-light: 0 4px 15px rgba(0, 0, 0, 0.1); /* 阴影稍重 */
  --box-shadow-medium: 0 8px 25px rgba(0, 0, 0, 0.18); /* 阴影更重，在浅背景上更明显 */
  --border-radius-medium: 10px; /* 圆角略小 */
  --border-radius-small: 6px; /* 圆角略小 */
}

/* !!! 新增全局 body 样式 !!! */
/* 在实际项目中，这部分应该放在全局 CSS 文件中，而不是 scoped style 中 */
body {
  background-color: var(--page-bg); /* 设置整个页面的背景色 */
  margin: 0; /* 确保没有默认外边距 */
  padding: 0; /* 确保没有默认内边距 */
  min-height: 100vh; /* 确保背景色覆盖整个视口高度 */
  font-family: 'Inter', "Helvetica Neue", Arial, sans-serif; /* 统一字体 */
}


/* --- Detail Page Styles --- */
.detail-container {
  max-width: 1000px;
  margin: 30px auto; /* 保持外边距，让它浮动在 page-bg 上 */
  padding: 35px;
  background-color: var(--light-bg); /* 内容容器背景色 */
  border-radius: var(--border-radius-medium);
  box-shadow: var(--box-shadow-medium); /* 调整阴影，使其在 page-bg 上更明显 */
  color: var(--dark-text);
  line-height: 1.6;
  transition: all 0.3s ease-in-out;
  background-image: linear-gradient(to bottom, var(--light-bg) 90%, #d8ded5); /* 渐变底部更深 */
  position: relative;
  overflow: hidden;
}

/* Header Styles */
.herb-header {
  text-align: center;
  margin-bottom: 35px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--light-grey-border);
  position: relative;
}

.herb-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 3px;
  background-color: var(--primary-green);
  border-radius: 2px;
}

.chinese-name {
  font-family: 'Noto Serif SC', "Source Han Serif SC", "宋体", serif;
  font-size: 38px;
  color: var(--primary-green);
  margin: 0 0 12px 0;
  font-weight: 700;
  letter-spacing: 0.8px;
}

.scientific-name {
  font-size: 18px;
  color: var(--medium-text);
  font-style: italic;
  margin: 8px 0;
}

.english-name {
  font-size: 16px;
  color: var(--accent-blue);
  margin-top: 8px;
}

/* Image Gallery */
.image-gallery {
  margin: 35px 0;
  padding: 24px;
  background-color: #f5f7f9;
  border-radius: 16px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e6ed;
}

.gallery-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 20px;
}

.gallery-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  background-color: #f9f9f9;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.gallery-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* 图片卡片样式 */
.image-card {
  cursor: pointer;
  aspect-ratio: 4/3;
}

.image-card .card-content {
  justify-content: center;
  padding: 0;
}

/* 位置信息卡片样式 */
.location-card {
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-color: #f0f7f0;
  border-left: 4px solid #28a745;
}

.location-title {
  font-family: 'Noto Serif SC', "Source Han Serif SC", serif;
  font-size: 20px;
  color: #2c3e50;
  margin: 0;
  text-align: left;
  padding: 16px 20px;
  background-color: rgba(40, 167, 69, 0.08);
  border-bottom: 1px solid rgba(40, 167, 69, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
}

.location-icon {
  color: #28a745;
  font-size: 18px;
}

.location-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
}

.location-text {
  font-style: normal;
  color: #445566;
  line-height: 1.6;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid #28a745;
  margin: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 992px) {
  .gallery-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 576px) {
  .gallery-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.herb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease-in-out;
  border-radius: 12px;
}

.image-card:hover .herb-image {
  transform: scale(1.05);
}

/* 图片悬停效果 */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.zoom-icon {
  color: white;
  background-color: rgba(40, 167, 69, 0.8);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  transform: scale(0.7);
  transition: all 0.3s ease;
}

.zoom-icon svg {
  width: 24px;
  height: 24px;
}

.image-card:hover .zoom-icon {
  transform: scale(1);
}



/* Lightbox Styles */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  margin: auto;
}

.lightbox-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border: 2px solid white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: -10px;
  font-size: 30px;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 1001;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.4);
}

.lightbox-prev {
  left: -60px;
}

.lightbox-next {
  right: -60px;
}

.lightbox-counter {
  position: absolute;
  bottom: -30px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 14px;
}

/* Info Sections Wrapper */
.info-sections-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

/* Info Blocks */
.info-block {
  /* background-color: var(--block-bg); */ /* 原始纯白色 */
  background-color: #fcfcfc; /* 使用一个非常淡的偏暖色 */
  padding: 30px;
  border-radius: var(--border-radius-medium);
  box-shadow: var(--box-shadow-light);
  border: 1px solid var(--border-color-main);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.info-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-green);
}

.info-title {
  font-family: 'Noto Serif SC', "Source Han Serif SC", "宋体", serif;
  font-size: 24px;
  color: var(--secondary-brown);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--light-grey-border);
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.info-icon {
  font-size: 26px;
  color: var(--primary-green);
}

.warning-icon {
  color: var(--warning-red);
}

.location-icon {
  color: var(--accent-blue);
}


/* Basic Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 15px;
  background-color: #f4f8f3;
  border-radius: var(--border-radius-small);
  border: 1px solid var(--primary-green);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.info-item:hover {
  border-color: var(--secondary-brown);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.info-label {
  font-weight: 600;
  color: var(--secondary-brown);
  margin-bottom: 6px;
  font-size: 14px;
}

.info-content {
  color: var(--dark-text);
  font-size: 15px;
}

/* Description Styles */
.description-text,
.location-details {
  line-height: 1.7;
  color: var(--medium-text);
  font-size: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
}

.description-item {
  margin-bottom: 0;
  padding: 18px;
  background-color: #f4f8f3;
  border-radius: var(--border-radius-small);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--primary-green);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.description-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  border-color: var(--secondary-brown);
}

.description-content {
  padding: 18px;
  background-color: #f4f8f3;
  border-radius: var(--border-radius-small);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--primary-green);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  grid-column: 1 / -1;
}

.description-content:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  border-color: var(--secondary-brown);
}

.variant-title {
  font-weight: 700;
  color: var(--primary-green);
  margin-bottom: 8px;
  display: block;
  font-size: 17px;
}

.variant-content {
  margin-left: 0;
  margin-top: 10px;
}

/* Medical Info Grid */
.medical-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.sub-title {
  font-family: 'Noto Serif SC', "Source Han Serif SC", "宋体", serif;
  font-size: 19px;
  color: var(--secondary-brown);
  margin-bottom: 15px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color-subtle);
  font-weight: 600;
}

.effect-group, .function-group {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f4f8f3;
  border-radius: var(--border-radius-small);
  border: 1px solid var(--primary-green);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.effect-group:hover, .function-group:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  border-color: var(--secondary-brown);
}

.effects-content, .functions-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.effect-type, .function-type {
  font-weight: 700;
  color: var(--accent-blue);
  margin-bottom: 10px;
  display: block;
  font-size: 16px;
}

.effect-list, .warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.effect-item, .warning-item {
  position: relative;
  padding-left: 25px;
  margin-bottom: 10px;
  color: var(--medium-text);
  font-size: 15px;
}

.effect-icon {
  position: absolute;
  left: 0;
  top: 3px;
  color: var(--primary-green);
  font-size: 16px;
}

.warning-item-icon {
  position: absolute;
  left: 0;
  top: 3px;
  color: var(--warning-red);
  font-size: 16px;
}

.function-desc {
  margin: 0;
}

/* Dosage and Precautions Styles */
.dosage-text {
  white-space: pre-wrap;
  background-color: #f4f8f3;
  padding: 20px;
  border-radius: var(--border-radius-small);
  font-family: 'Fira Code', 'Courier New', monospace;
  color: var(--dark-text);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
  font-size: 15px;
  border: 1px solid var(--primary-green);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.dosage-text:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  border-color: var(--secondary-brown);
}

.warning-content {
  background-color: #fff4d0;
  padding: 0;
  border-radius: var(--border-radius-small);
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.warning-group {
  margin-bottom: 0;
  padding: 15px;
  background-color: #fff4d0;
  border-radius: var(--border-radius-small);
  border: 1px solid var(--warning-yellow);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.warning-group:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  border-color: var(--warning-red);
}

.warning-text {
  padding: 15px;
  background-color: #fff4d0;
  border-radius: var(--border-radius-small);
  border: 1px solid var(--warning-yellow);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  margin: 0;
}

.warning-text:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  border-color: var(--warning-red);
}

.warning-type {
  font-weight: 700;
  color: var(--warning-red);
  margin-bottom: 10px;
  display: block;
  font-size: 16px;
}

/* Back Button */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 30px;
  padding: 10px 20px;
  background-color: var(--primary-green);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  font-weight: 600;
  font-size: 15px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

.back-button:hover {
  background-color: #1e8e3e;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
}

.back-button .fas {
  font-size: 16px;
}

/* Loading and Error States */
.loading-state {
  text-align: center;
  padding: 60px;
  background-color: var(--light-bg);
  border-radius: var(--border-radius-medium);
  box-shadow: var(--box-shadow-light);
  margin: 30px auto;
  max-width: 500px;
  border: 1px solid var(--border-color-main);
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid var(--primary-green);
  width: 50px;
  height: 50px;
  margin-bottom: 15px;
}

.loading-text {
  margin-top: 12px;
  color: var(--medium-text);
  font-size: 16px;
}

.error-message {
  color: var(--warning-red);
  padding: 25px;
  background-color: #ffebe0;
  border-radius: var(--border-radius-small);
  border: 1px solid #ef9a9a;
  font-size: 16px;
  line-height: 1.5;
}

.error-link {
  color: var(--accent-blue);
  margin-top: 12px;
  font-weight: 500;
}

/* Responsive Adjustments */
@media (min-width: 992px) {
  .info-sections-wrapper {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "basic-info description-info"
      "medical-info medical-info"
      "dosage-info precautions-info";
  }
  .basic-info { grid-area: basic-info; }
  .description-info { grid-area: description-info; padding: 25px; }
  .medical-info { grid-area: medical-info; }
  .dosage-info { grid-area: dosage-info; }
  .precautions-info { grid-area: precautions-info; }
}


@media (max-width: 768px) {
  .detail-container {
    padding: 20px;
    margin: 20px auto;
  }

  .chinese-name {
    font-size: 30px;
  }

  .scientific-name {
    font-size: 16px;
  }

  .english-name {
    font-size: 14px;
  }

  .image-gallery {
    padding: 16px;
    margin: 25px 0;
  }
  
  .gallery-container {
    gap: 18px;
  }
  
  .zoom-icon {
    width: 40px;
    height: 40px;
  }
  
  .zoom-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .lightbox-nav {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }
  
  .lightbox-prev {
    left: -45px;
  }
  
  .lightbox-next {
    right: -45px;
  }

  .info-block {
    padding: 20px;
  }

  .info-title {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .info-icon {
    font-size: 22px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .info-item {
    padding: 12px;
  }
  
  .description-text {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .description-item, 
  .description-content,
  .effect-group, 
  .function-group,
  .warning-group,
  .warning-text {
    padding: 12px;
  }

  .medical-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .sub-title {
    font-size: 17px;
  }

  .dosage-text,
  .warning-content {
    font-size: 14px;
  }
  
  .dosage-text {
    padding: 15px;
  }
  
  .warning-content {
    padding: 0;
    gap: 12px;
  }
  
  .location-title {
    font-size: 18px;
    padding: 14px 16px;
  }
  
  .location-content {
    padding: 14px 16px;
  }

  .back-button {
    padding: 8px 18px;
    font-size: 14px;
    margin-top: 25px;
  }

  .loader {
    width: 40px;
    height: 40px;
  }

  .loading-text, .error-message {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .detail-container {
    padding: 10px;
    margin: 10px auto;
  }

  .chinese-name {
    font-size: 26px;
  }

  .scientific-name {
    font-size: 14px;
  }

  .english-name {
    font-size: 12px;
  }
  
  .image-gallery {
    padding: 12px;
  }
  
  .gallery-container {
    gap: 14px;
  }
  
  .gallery-card {
    border-radius: 10px;
  }
  
  .herb-image {
    border-radius: 10px;
  }
  
  .image-overlay {
    border-radius: 10px;
  }
  
  .zoom-icon {
    width: 40px;
    height: 40px;
  }
  
  .zoom-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .lightbox-nav {
    width: 36px;
    height: 36px;
    font-size: 20px;
    background: rgba(255, 255, 255, 0.3);
  }
  
  .lightbox-prev {
    left: 10px;
  }
  
  .lightbox-next {
    right: 10px;
  }

  .info-block {
    padding: 12px;
  }

  .info-title {
    font-size: 18px;
    gap: 6px;
  }

  .info-icon {
    font-size: 20px;
  }

  .info-item {
    padding: 10px;
  }
  
  .description-text {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .description-item, 
  .description-content,
  .effect-group, 
  .function-group,
  .warning-group,
  .warning-text {
    padding: 10px;
  }
  
  .warning-content {
    gap: 10px;
  }

  .dosage-text {
    padding: 10px;
    font-size: 13px;
  }
  
  .warning-content {
    padding: 0;
  }
  
  .location-title {
    font-size: 16px;
    padding: 12px;
  }
  
  .location-content {
    padding: 12px;
  }
  
  .location-text {
    padding: 10px;
    font-size: 13px;
  }

  .back-button {
    padding: 6px 15px;
    font-size: 13px;
  }
}
</style>