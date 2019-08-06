import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/account',
    children: [{
      path: 'account',
      name: 'Account',
      component: () => import('@/views/account/index'),
      meta: { title: '账户', icon: 'user' }
    }]
  },
  {
    path: '/auto',
    component: Layout,
    redirect: '/auto/moving',
    children: [
      {
        path: 'moving',
        name: 'moving',
        component: () => import('@/views/moving/index'),
        meta: { title: '搬砖', icon: 'example' }
      }
    ]
  },
  {
    path: '/market',
    component: Layout,
    redirect: '/market/details',
    children: [
      {
        path: 'details',
        name: 'market',
        component: () => import('@/views/market/index'),
        meta: { title: '行情', icon: 'example' }
      }
    ]
  },

  // {
  //   path: '/exchange',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'Form',
  //       component: () => import('@/views/exchange/index'),
  //       meta: { title: '交易', icon: 'form' }
  //     }
  //   ]
  // },

  // {
  //   path: '/quantifying',
  //   component: Layout,
  //   redirect: '/quantifying/transactions',
  //   children: [
  //     {
  //       path: '/quantifying/transactions',
  //       component: () => import('@/views/quantifying/index'),
  //       meta: { title: '量化', icon: 'nested' }
  //     }
  //   ]
  // },

  // {
  //   path: '/assisted',
  //   component: Layout,
  //   redirect: '/assisted/tools',
  //   children: [
  //     {
  //       path: '/assisted/tools',
  //       component: () => import('@/views/assisted/index'),
  //       meta: { title: '辅助工具', icon: 'link' }
  //     }
  //   ]
  // },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
