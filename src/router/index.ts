// Vue
import Vue from 'vue';
import Router from 'vue-router';

// Pages
import AdminPage from '@/pages/admin-page.vue';
import DevicesPage from '@/pages/devices-page.vue';
import HomePage from '@/pages/home-page.vue';
import LocationPage from '@/pages/location-page.vue';
import UserLoginPage from '@/pages/user-login-page.vue';
import UserRegisterPage from '@/pages/user-register-page.vue';
import SensorPage from '@/pages/sensors-page.vue';
import SettingsPage from '@/pages/settings-page.vue';

// Store
import { Status } from '@/store/user';

// Services & helpers
import {log} from '@/services/logger';

Vue.use(Router);

const routes = [
  { path: '/', name: 'home', component: HomePage},
  { path: '/admin', name: 'admin', component: AdminPage},
  { path: '/devices', name: 'devices', component: DevicesPage},
  { path: '/locations', name: 'locations', component: LocationPage},
  { path: '/settings', name: 'settings', component: SettingsPage },
  { path: '/sensors', name: 'sensors', component: SensorPage },
  { path: '/login', name: 'login', component: UserLoginPage},
  { path: '/register', name: 'register', component: UserRegisterPage},
  { path: '*', redirect: '/' },
];

export const router = new Router({ routes });

const publicPaths: string[] = ['/', '/login', '/register', '/shared'];

export function isPublicPath(path: string) {
  return publicPaths.find( (item) => path === item);
}
export function loginRequired(path: string): boolean {
  return Vue.$store.user.status !== Status.LOGGED_IN && !isPublicPath(path);
}
router.beforeEach((to, from, next) => {
  if (loginRequired (to.path)) {
    log.debug('router.beforeEach Log in required!!!');
    return next({
      path: '/login',
      query: { returnUrl: to.path },
    });
  }
  next();
});
