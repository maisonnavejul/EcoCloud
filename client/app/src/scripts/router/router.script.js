import { createWebHistory, createRouter } from 'vue-router'

import Login from '../../components/login/login.component.vue';
import Register from '../../components/register/register.component.vue';
import Home from '../../components/home/home.component.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/', component: Home },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;