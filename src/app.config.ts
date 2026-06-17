export default defineAppConfig({
  pages: [
    'pages/handover/index',
    'pages/center/index',
    'pages/batch/index',
    'pages/delivery/index',
    'pages/trace/index',
    'pages/handover-detail/index',
    'pages/handover-create/index',
    'pages/batch-detail/index',
    'pages/delivery-detail/index',
    'pages/scan-receive/index',
    'pages/trace-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#00B8D9',
    navigationBarTitleText: '消毒供应协同',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F0F5F8'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#00B8D9',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/handover/index',
        text: '门诊交接'
      },
      {
        pagePath: 'pages/center/index',
        text: '中心接收'
      },
      {
        pagePath: 'pages/batch/index',
        text: '批次处理'
      },
      {
        pagePath: 'pages/delivery/index',
        text: '配送签收'
      },
      {
        pagePath: 'pages/trace/index',
        text: '追溯凭证'
      }
    ]
  }
})
