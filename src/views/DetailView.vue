<template>
  <div v-if="herb" class="detail-container">
    <!-- 头部信息 -->
    <div class="header">
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
    </div>

    <!-- 图片展示 -->
    <div class="image-gallery">
      <img
        v-for="(img, index) in herb.images"
        :key="index"
        :src="resolveImage(img)"
        :alt="herb.name"
        class="herb-image"
        @error="handleImageError"
      >
    </div>

    <!-- 基本信息 -->
    <div class="info-section">
      <div class="info-block basic-info">
        <h2 class="info-title">基本信息</h2>
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
      </div>

      <!-- 形态特征 -->
      <div class="info-block">
        <h2 class="info-title">形态特征</h2>
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
      </div>

      <!-- 药用信息 -->
      <div class="info-block medical-info">
        <h2 class="info-title">药用信息</h2>
        <div class="medical-grid">
          <div class="effects">
            <h3 class="sub-title">主要功效</h3>
            <div class="effects-content">
              <template v-if="isObject(herb.effects)">
                <div v-for="(effects, key) in herb.effects" :key="key" class="effect-group">
                  <strong class="effect-type">{{ key }}：</strong>
                  <ul class="effect-list">
                    <li v-for="(effect, idx) in effects" :key="idx" class="effect-item">
                      <i class="fas fa-leaf"></i>{{ effect }}
                    </li>
                  </ul>
                </div>
              </template>
              <template v-else>
                <ul class="effect-list">
                  <li v-for="(effect, idx) in herb.effects" :key="idx" class="effect-item">
                    <i class="fas fa-leaf"></i>{{ effect }}
                  </li>
                </ul>
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
                <p class="function-desc">{{ herb.functions }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 用法用量 -->
      <div class="info-block dosage-info">
        <h2 class="info-title">用法用量</h2>
        <pre class="dosage-text">{{ formatDosage(herb.dosage) }}</pre>
      </div>

      <!-- 注意事项 -->
      <div class="info-block precautions">
        <h2 class="info-title">注意事项</h2>
        <div class="warning-content">
          <template v-if="isObject(herb.precautions)">
            <div v-for="(items, key) in herb.precautions" :key="key" class="warning-group">
              <strong class="warning-type">{{ key }}：</strong>
              <ul class="warning-list">
                <li v-for="(item, idx) in items" :key="idx" class="warning-item">
                  <i class="fas fa-exclamation-triangle"></i>{{ item }}
                </li>
              </ul>
            </div>
          </template>
          <template v-else>
            <p class="warning-text">{{ herb.precautions }}</p>
          </template>
        </div>
      </div>
    </div>

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
  } catch (err) {
    errorMsg.value = `数据加载失败: ${err.message}`
    console.error('完整错误信息:', err)
  }
})
</script>

<style scoped>
/* 基础样式 */
.detail-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  border-radius: 12px;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

/* 头部样式 */
.header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
}

.chinese-name {
  font-size: 2.8rem;
  color: #2c3e50;
  margin: 0.5rem 0;
  font-weight: 600;
  letter-spacing: 2px;
}

.scientific-name {
  color: #7f8c8d;
  font-style: italic;
  font-size: 1.4rem;
  margin: 0.5rem 0;
  line-height: 1.6;
}

.english-name {
  color: #3498db;
  font-size: 1.2rem;
  font-weight: 500;
}

/* 图片区域 */
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.herb-image {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.herb-image:hover {
  transform: translateY(-5px);
}

/* 信息区块 */
.info-section {
  display: grid;
  gap: 2rem;
}

.info-block {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  border-left: 4px solid #2ecc71;
}

.info-title {
  color: #27ae60;
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #2ecc71;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.info-title::before {
  content: '';
  width: 8px;
  height: 1.6rem;
  background: #2ecc71;
  border-radius: 2px;
}

/* 基本信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.8rem;
  background: rgba(255,255,255,0.8);
  border-radius: 6px;
}

.info-label {
  color: #7f8c8d;
  font-weight: 500;
  min-width: 70px;
  flex-shrink: 0;
}

.info-content {
  color: #2c3e50;
  line-height: 1.6;
}

/* 形态特征 */
.description-text {
  line-height: 1.8;
  color: #555;
}

.description-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.variant-title {
  color: #3498db;
  font-size: 1.1em;
}

.variant-content {
  margin: 0.5rem 0 0 1rem;
}

/* 药用信息 */
.medical-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.sub-title {
  color: #2c3e50;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sub-title::before {
  content: '▹';
  color: #2ecc71;
}

.effect-group {
  margin-bottom: 1.5rem;
}

.effect-type {
  color: #e67e22;
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.1em;
}

.effect-list {
  list-style: none;
  padding-left: 1.5rem;
}

.effect-item {
  position: relative;
  margin-bottom: 0.8rem;
  padding-left: 1.8rem;
  line-height: 1.6;
}

.effect-item .fa-leaf {
  position: absolute;
  left: 0;
  top: 0.3em;
  color: #2ecc71;
  font-size: 0.9em;
}

/* 用法用量 */
.dosage-text {
  white-space: pre-wrap;
  line-height: 1.8;
  background: #fff;
  padding: 1.5rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  color: #2c3e50;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.05);
}

/* 注意事项 */
.warning-content {
  background: #fff8f8;
  padding: 1.5rem;
  border-radius: 6px;
}

.warning-group {
  margin-bottom: 1.5rem;
}

.warning-type {
  color: #c0392b;
  display: block;
  margin-bottom: 0.8rem;
  font-size: 1.1em;
}

.warning-list {
  list-style: none;
  padding-left: 2rem;
}

.warning-item {
  position: relative;
  margin-bottom: 0.8rem;
  padding-left: 1.8rem;
  line-height: 1.6;
}

.warning-item .fa-exclamation-triangle {
  position: absolute;
  left: 0;
  top: 0.3em;
  color: #c0392b;
  font-size: 0.9em;
}

/* 返回按钮 */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 2rem;
  margin-top: 2rem;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 4rem;
}

.loader {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #7f8c8d;
  margin-top: 1rem;
}

.error-message {
  color: #c0392b;
  padding: 2rem;
  background: #fdeded;
  border-radius: 8px;
}

.error-link {
  display: inline-block;
  margin-top: 1rem;
  color: #3498db;
  text-decoration: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-container {
    padding: 1rem;
    margin: 1rem;
  }

  .chinese-name {
    font-size: 2rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .herb-image {
    height: 220px;
  }

  .medical-grid {
    grid-template-columns: 1fr;
  }
}
</style>