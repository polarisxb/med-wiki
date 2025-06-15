<template>
  <div class="category-page">
    <!-- 面包屑导航 -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <ol>
        <li><router-link to="/">首页</router-link></li>
        <li v-for="(crumb, index) in breadcrumbs" :key="index">
          <router-link v-if="index < breadcrumbs.length - 1" :to="crumb.path">
            {{ crumb.name }}
          </router-link>
          <span v-else>{{ crumb.name }}</span>
        </li>
      </ol>
    </nav>

    <!-- 当前层级内容 -->
    <div v-if="currentNode" class="content">
      <h1 class="page-title">{{ currentNode.name }}</h1>
      
      <!-- 子分类 -->
      <div v-if="currentNode.children && currentNode.children.length > 0" class="sub-categories">
        <h2>子分类</h2>
        <div class="category-grid">
          <router-link 
            v-for="child in currentNode.children"
            :key="child.id"
            :to="`/category/${type}/${[...pathSegments, child.id].join('/')}`"
            class="category-card"
          >
            <span class="category-name">{{ child.name }}</span>
          </router-link>
        </div>
      </div>

      <!-- 药材列表 -->
      <div v-else-if="currentNode.herbs && currentNode.herbs.length > 0" class="herb-list">
        <h2>包含的药材</h2>
        <div class="herb-grid">
          <router-link
            v-for="herbId in currentNode.herbs"
            :key="herbId"
            :to="`/detail/${herbId}`"
            class="herb-card"
          >
            <span class="herb-name">{{ getHerbName(herbId) }}</span>
          </router-link>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-category">
        <p>该分类下暂无内容</p>
      </div>
    </div>

    <div v-else class="empty">
      <h2>分类不存在</h2>
      <router-link to="/" class="back-home">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import categoriesData from '@/data/categories.json'
import herbsData from '@/data/herbs.json'

const route = useRoute()

const type = computed(() => route.params.type)
const pathSegments = computed(() => 
  Array.isArray(route.params.path) ? route.params.path : (route.params.path ? route.params.path.split('/') : [])
)

const currentNode = computed(() => {
  if (!type.value || !categoriesData[type.value]) return null
  let node = categoriesData[type.value]
  
  for (const segment of pathSegments.value) {
    if (!node.children) break
    const childNode = node.children.find(child => child.id === segment)
    if (!childNode) return null
    node = childNode
  }
  return node
})

const breadcrumbs = computed(() => {
  const crumbs = []
  let node = categoriesData[type.value]
  if (!node) return crumbs

  crumbs.push({ name: node.name, path: `/category/${type.value}` })
  
  let currentPath = ''
  for (const segment of pathSegments.value) {
    currentPath += `/${segment}`
    const childNode = node.children?.find(child => child.id === segment)
    if (!childNode) break
    node = childNode
    crumbs.push({ name: node.name, path: `/category/${type.value}${currentPath}` })
  }
  return crumbs
})

const getHerbName = (id) => {
  return herbsData.find(h => h.id === id)?.name || '未知药材'
}
</script>

<style scoped>
.category-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  min-height: 70vh;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.breadcrumb {
  background: rgba(248, 249, 250, 0.7);
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.breadcrumb ol {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.breadcrumb li {
  display: inline;
  font-size: 14px;
}

.breadcrumb li + li:before {
  content: "›";
  padding: 0 8px;
  color: #4CAF50;
}

.breadcrumb a {
  color: #4CAF50;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb a:hover {
  color: #45a049;
  text-decoration: underline;
}

.content {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.page-title {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(76, 175, 80, 0.3);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
}

h2 {
  color: #4CAF50;
  font-size: 18px;
  margin-bottom: 20px;
}

.category-grid,
.herb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
}

.category-card,
.herb-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 18px;
  text-align: center;
  transition: all 0.3s;
  text-decoration: none;
  color: #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.category-card:hover,
.herb-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(76, 175, 80, 0.15);
  border-color: #4CAF50;
}

.category-name,
.herb-name {
  font-weight: 500;
}

.empty-category,
.empty {
  text-align: center;
  padding: 40px;
  background: rgba(248, 249, 250, 0.7);
  border-radius: 12px;
  color: #666;
  border: 1px dashed rgba(76, 175, 80, 0.3);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.03);
}

.back-home {
  display: inline-block;
  padding: 12px 25px;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 30px;
  transition: all 0.3s;
  margin-top: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.back-home:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .category-page {
    padding: 15px;
    margin: 10px;
  }
  
  .content {
    padding: 20px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .category-grid,
  .herb-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
  
  .category-card,
  .herb-card {
    padding: 15px;
  }
}
</style>