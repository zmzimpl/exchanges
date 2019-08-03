import request from '@/utils/request'

export function getWalletInfo(params, option) {
  return request({
    url: '/table/list',
    method: 'get',
    params
  })
}
