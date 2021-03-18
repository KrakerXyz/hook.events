
import { createRouter, createWebHistory, RouteRecordRaw, Router } from 'vue-router';
import Home from './components/Home.vue';

const routes: RouteRecordRaw[] = [
   {
      path: '/',
      name: 'home',
      component: Home
   },
   {
      path: '/docs/:view?',
      name: 'docs',
      props: true,
      component: (): any => import('@/components/docs/Docs.vue')
   },
   {
      path: '/hook/:hookId',
      name: 'hook',
      props: true,
      component: (): any => import('@/components/Hook.vue')
   }
];

export const router = createRouter({
   history: createWebHistory(process.env.BASE_URL),
   routes,
   linkActiveClass: 'active',
   linkExactActiveClass: 'active-exact'
});

/** Injects instance of router created at startup. Save to use outside of setup() */
export function injectRouter(): Router {
   return router;
}

