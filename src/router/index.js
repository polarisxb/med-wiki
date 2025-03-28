import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  {
    path: '/category/:type/:path*', // 动态匹配多级路径
    component: () => import('@/views/CategoryView.vue'),
    props: true
  },
  { path: '/detail/:id', component: () => import('@/views/DetailView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router