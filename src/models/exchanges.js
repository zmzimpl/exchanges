import { UUID } from '@/utils/uuid'

export function getExchanges() {
  return [
    {
      'id': 'binance',
      'name': '币安网',
      'logo': require('@/assets/exchanges-icon/binance.webp'),
      'rank': 1,
      'coins': [],
      'accounts': []
    },
    {
      'id': 'huobipro',
      'name': '火币全球站',
      'logo': require('@/assets/exchanges-icon/huobipro.webp'),
      'rank': 2,
      'coins': [],
      'accounts': [],
    },
    {
      'id': 'okex3',
      'name': 'OKEX',
      'logo': require('@/assets/exchanges-icon/okex.webp'),
      'rank': 3,
      'coins': [],
      'accounts': []
    },
    {
      'id': 'gateio',
      'name': 'gate.io',
      'logo': require('@/assets/exchanges-icon/gate-io.webp'),
      'rank': 6,
      'coins': [],
      'accounts': []
    },
  ]
}

export function getTestAccount() {
  return {
    'huobipro': [{
      id: UUID(),
      name: "huobipro-test",
      apiKey: "f80b4bf4-8a54feed-hrf5gdfghe-e60ca",
      secretKey: "6c7af6de-0f6897f0-e2edff1a-27ba9",
      validatePassword: ""
    }],
    'binance': [{
      id: UUID(),
      name: "binance-test",
      apiKey: "R3yu6eeOl1etcGYzp5wBifH8G1DNLQuIRaarwp0dDGI2EfsQCPf0sjz2dhr410KO",
      secretKey: "pElltSAepA05VAvbKnjSExJJLIhp0LRNVP8Fg3OlAG6uY68DeRFEeJ13CWFZTU8l",
      validatePassword: ""
    }]
  }
}
