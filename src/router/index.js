import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import appMain from '@/components/appMain'
import Index from '@/components/home'
import CateMana from '@/components/CateMana'
import DataCharts from '@/components/DataCharts'
import UserMana from '@/components/UserMana'
import {infoList, infoEdit, infoDetail} from '@/components/information'
import {strategyList, strategyEdit, strategyDetail} from '@/components/strategy'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '登录',
      hidden: true,
      component: Login
    }, {
      path: '/home',
      name: '',
      component: Index,
      hidden: true
    }, {
      path: '/',
      component: appMain,
      name: '竞争信息管理',
      iconCls: 'fa fa-file-text-o',
      children: [
        {
          path: '/infolist',
          name: '竞争信息列表',
          component: infoList,
          meta: {
            keepAlive: true
          }
        }, {
          path: '/postInfo',
          name: '发布竞争信息',
          component: infoEdit,
          meta: {
            keepAlive: false
          }
        }, {
          path: '/infoDetail',
          name: '竞争信息详情',
          component: infoDetail,
          hidden: true,
          meta: {
            keepAlive: false
          }
        }, {
          path: '/editInfo',
          name: '编辑竞争信息',
          component: infoEdit,
          hidden: true,
          meta: {
            keepAlive: false
          }
        }
      ]
    },  {
      path: '/',
      component: appMain,
      name: '策略信息管理',
      iconCls: 'fa fa-file-text-o',
      children: [
        {
          path: '/strategylist',
          name: '策略信息列表',
          component: strategyList,
          meta: {
            keepAlive: true
          }
        }, {
          path: '/postStrategy',
          name: '发布策略信息',
          component: strategyEdit,
          meta: {
            keepAlive: false
          }
        }, {
          path: '/strategyDetail',
          name: '策略信息详情',
          component: strategyDetail,
          hidden: true,
          meta: {
            keepAlive: false
          }
        }, {
          path: '/editStrategy',
          name: '编辑策略信息',
          component: strategyEdit,
          hidden: true,
          meta: {
            keepAlive: false
          }
        }
      ]
    },{
      path: '/home',
      component: appMain,
      name: '用户管理',
      children: [
        {
          path: '/user',
          iconCls: 'fa fa-user-o',
          name: '用户管理',
          component: UserMana
        }
      ]
    }
    // , {
    //   path: '/home',
    //   component: appMain,
    //   name: '栏目管理',
    //   children: [
    //     {
    //       path: '/cateMana',
    //       iconCls: 'fa fa-reorder',
    //       name: '栏目管理',
    //       component: CateMana
    //     }
    //   ]
    // }, {
    //   path: '/home',
    //   component: appMain,
    //   name: '数据统计',
    //   iconCls: 'fa fa-bar-chart',
    //   children: [
    //     {
    //       path: '/charts',
    //       iconCls: 'fa fa-bar-chart',
    //       name: '数据统计',
    //       component: DataCharts
    //     }
    //   ]
    // }
  ]
})
