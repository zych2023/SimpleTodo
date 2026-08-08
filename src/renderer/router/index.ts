import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Todo',
      component: () => import('../views/Todo.vue')
    },
    {
      path: '/done',
      name: 'Done',
      component: () => import('../views/Done.vue')
    }
  ]
})

export default router
