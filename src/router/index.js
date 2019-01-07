import {
  Forbidden,
  Offline
} from '@xuhengfeng/vue-components'
// 发布通知
const PublishInform = () => import('pages/PublishInform')
const PublishInformEdit = () => import('pages/PublishInform/children/Edit')

// 我的草稿
const Draft = () => import('pages/Draft')
const DraftList = () => import('pages/Draft/children/List')
const DraftListDetails = () => import('pages/Draft/children/Details')
const DraftListEdit = () => import('pages/Draft/children/Edit')

// 历史通知
const InformList = () => import('pages/InformList')
const InformListList = () => import('pages/InformList/children/List')
const InformListDetails = () => import('pages/InformList/children/Details')

// 全部路由
const TotalRouter = [
  // 发布通知
  {
    path: '/PublishInform',
    component: PublishInform,
    name: 'PublishInform',
    redirect: '/PublishInform/Edit',
    children: [{
      path: 'Edit',
      component: PublishInformEdit,
      name: 'PublishInformEdit'
    }]
  },
  // 我的草稿
  {
    path: '/Draft',
    component: Draft,
    name: 'Draft',
    redirect: '/Draft/List',
    children: [{
      path: 'List',
      component: DraftList,
      name: 'DraftList'
    },
    {
      path: 'Details',
      component: DraftListDetails,
      name: 'DraftListDetails'
    },
    {
      path: 'Edit',
      component: DraftListEdit,
      name: 'DraftListEdit'
    }
    ]
  },
  // 历史通知
  {
    path: '/InformList',
    component: InformList,
    name: 'InformList',
    redirect: '/InformList/List',
    children: [{
      path: 'List',
      component: InformListList,
      name: 'InformListList'
    },
    {
      path: 'Details',
      component: InformListDetails,
      name: 'InformListDetails'
    }
    ]
  }
]

// 无权访问提示页
const ForbiddenRouter = [{
  path: '*',
  redirect: '/403'
},
{
  path: '/403',
  component: Forbidden
}
]
// 应用未上架提示页
const OfflineRouter = [{
  path: '*',
  redirect: '/offline'
},
{
  path: '/offline',
  component: Offline
}
]
export {
  TotalRouter,
  ForbiddenRouter,
  OfflineRouter
}
