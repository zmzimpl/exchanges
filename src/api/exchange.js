import request from '@/utils/request'

const signInfo = {
  SignatureMethod: 'HmacSHA256',
  SignatureVersion: 2
}

export function getWalletInfo(params, option) {
  return request({
    url: '/v1/account/accounts',
    method: 'get',
    params: Object.assign(params, signInfo)
  })
}
