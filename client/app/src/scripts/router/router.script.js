import { createWebHistory, createRouter } from 'vue-router'

import Login from '../../components/login/login.component.vue';
import Register from '../../components/register/register.component.vue';
import Home from '../../components/home/home.component.vue';
import AddUser from '../../components/add_user/add_user.component.vue';
import Admin from '../../components/admin_page/admin_page.component.vue';
import store from '../store/store.script';

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/admin', component: Admin},
  { path: '/adduser', component: AddUser, props: true},
  { path: '/', component: Home },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  if (!store.state.is_logged_in && to.path !== '/login') {
    next('/login');
  } else {
    next();
  }
});

export default router;