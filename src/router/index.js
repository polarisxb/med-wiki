import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  {
    path: '/category/:type/:path*', // 动态匹配多级路径
    component: () => import('@/views/CategoryView.vue'), // 恢复为静态导入
    props: true
  },
  {
    path: '/location-map', // 为地图页面添加新路由
    component: () => import('@/views/LocationCategoryView.vue')
  },
  { path: '/detail/:id', component: () => import('@/views/DetailView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router