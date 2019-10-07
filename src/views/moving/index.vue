<template>
  <div class="moving-container">
    <el-row :gutter="24">
      <el-col :xs="24" :xl="16" :span="16">
        <el-card v-for="(moveForm, moveIndex) in moves" :key="moveIndex" :ref="'card' + moveIndex" :class="{ 'moving-card' : moveIndex !== 0 }">
          <div slot="header" class="clearfix">
            <div class="moving-center">
              <span>当前交易对：<span class="text-primary"> {{ moveForm.transaction }} </span> </span>
              <span>收益：<span class="text-success"> {{ moveForm.profit + '%' }} </span> </span>
            </div>
          </div>
          <el-col :xs="16" :xl="16" :span="16">
            <el-form :ref="moveIndex" :model="moveForm" label-width="100px" class="moving-form">
              <el-form-item
                prop="transaction"
                label="交易对"
                :rules="[
                  { required: true, message: '请选择交易对', trigger: 'change' }
                ]"
              >
                <el-select v-model="moveForm.transaction" placeholder="请选择交易对" class="moving-select">
                  <el-option
                    v-for="item in transactions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                v-for="(account, index) in moveForm.accounts"
                :key="account.key"
                :label="'API账号' + index"
                :prop="'accounts.' + index + '.value'"
                :rules="{
                  required: true, message: 'API账号不能为空', trigger: 'blur'
                }"
              >
                <el-cascader
                  v-model="account.value"
                  :props="{'value': 'id', 'label': 'name', 'children': 'accounts'}"
                  :options="apiAccounts"
                  @change="accountChecked"
                  class="moving-select" />
                <el-button @click.prevent="removeAccount(moveForm, account)">移除</el-button>
              </el-form-item>
              <el-form-item class="moving-center">
                <el-button type="primary" @click="startMove(moveIndex, moveForm)">{{ !moveForm.isStarted ? '开始' : '暂停' }}</el-button>
                <el-button @click="addAccount(moveForm)">新增API账号</el-button>
                <el-button type="danger" v-if="moves.length > 1" @click="removeForm(moveIndex)">删除</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :xs="8" :xl="8" :span="8">
            <el-card :body-style="{ overflow: 'auto', height: moveForm.accounts.length > 2 ? (moveForm.accounts.length * 60) + 'px' : '120px' }">
              <div slot="header" class="clearfix">
                <div class="moving-center">
                  <span class="text-primary">日志</span>
                </div>
              </div>
              <div class="text-center">
                <div v-if="!moveForm.logs.length" class="text-info text-sm"> 暂无 </div>
                <div v-for="(log, i) in moveForm.logs" :key="i" class="text-sm" :style="{color: log.color}"> {{ log.msg }} </div>
              </div>
            </el-card>
          </el-col>
          <div style="clear: both"></div>
        </el-card>
        <el-row type="flex" justify="center">
          <el-col :span="16" class="moving-center" style="margin: 24px 0">
            <el-button round style="width: 40%" @click="addMove()">
              <i class="el-icon-plus" /> 新建
            </el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :xs="24" :xl="8" :span="8">
        <el-table
          :data="tableData"
          stripe
          border
          style="width: 100%">
          <el-table-column
            prop="date"
            label="时间"
            width="180">
          </el-table-column>
          <el-table-column
            prop="exchange"
            label="交易所"
            width="180">
          </el-table-column>
          <el-table-column
            prop="profit"
            label="盈利">
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>

import { exchanges } from '@/models/exchanges'
import { async } from 'q'

const ccxt = require ('ccxt')

export default {
  data() {
    return {
      transactions: window.customConfig.transactions,
      apiAccounts: exchanges,
      moves: [{
        accounts: [{
          key: Date.now(),
          value: []
        },{
          key: Date.now() + 100,
          value: []
        }],
        transaction: '',
        profit: 0,
        logs: [],
        isStarted: false,
        timerId: null,
        count: 0
      }],
      tableData: [{
        date: '2019-05-02',
        exchange: '币安',
        profit: '0.5%'
      }, {
        date: '2019-05-04',
        exchange: '火币Pro',
        profit: '0.3%'
      }]
    }
  },
  methods: {
    startMove(formName, model) {
      model.isStarted = !model.isStarted;
      if (model.isStarted) {
        model.timerId = setInterval(() => {
          model.logs.push({msg: '第' + ++model.count + '次请求...', color: 'blue'})
          this.autoMove(model)
        }, 5000)
      } else {
        window.clearInterval(model.timerId)
      }
    },
    autoMove(model) {
      model.accounts.forEach(item => {
        const account = this.getAccountsById(item.value[0]).find(f => f.id === item.value[1])
        if (!model[item.value[0]]) {
          model[item.value[0]] = new ccxt[item.value[0]]({...account, enableRateLimit: true, 'options': { 'adjustForTimeDifference': true }})
        };
        (async () => {
          model[item.value[0]].fetchTicker(model.transaction).then(rs => {
            model.logs.push({msg: item.value[0] + '： 买一：' + rs.bid + '; 卖一：' + rs.ask, color: this.randomColor()})
          })
        })();
      })
    },
    removeForm(moveIndex) {
      this.moves.splice(moveIndex, 1)
    },
    removeAccount(moveForm, item) {
      var index = moveForm.accounts.indexOf(item)
      if (index !== -1) {
        moveForm.accounts.splice(index, 1)
      }
    },
    addAccount(form) {
      form.accounts.push({
        value: [],
        key: Date.now()
      })
    },
    addMove() {
      this.moves.push({
        accounts: [{
          key: Date.now(),
          value: []
        }],
        transaction: '',
        profit: 0,
        logs: [],
        isStarted: false,
        timerId: null,
        count: 0
      })
    },
    // 根据交易所ID获取已添加的账号信息
    getAccountsById(id, isMap) {
        let tempAccounts = localStorage.getItem(id)
        if (!tempAccounts) {
          tempAccounts = []
        } else {
          if (isMap) {
            tempAccounts = JSON.parse(tempAccounts).map((item, index) => {
              item.id = item.id
              return item
            })
          } else {
            tempAccounts = JSON.parse(tempAccounts)
          }
        }
        return tempAccounts
    },
    accountChecked(checked) {
      // console.log(checked)
    },
    randomColor() {
     this.r = Math.floor(Math.random()*255);
     this.g = Math.floor(Math.random()*255);
     this.b = Math.floor(Math.random()*255);
     return 'rgba('+ this.r +','+ this.g +','+ this.b +',0.8)';
    }
  },
  created() {
    this.apiAccounts.forEach(item => {
      item.accounts = this.getAccountsById(item.id, true);
    })
  },
  mounted() {
  }
}
</script>

<style lang="scss" scoped>
.moving {
  &-container {
    margin: 30px;
  }
  &-form {
    width: 100%;
  }
  &-grid-content {
    padding: 24px;
    border: 1px solid #ebebeb;
    border-radius: 3px;
    transition: .2s;
  }
  &-select {
    margin-right: 10px;
    width: calc(100% - 100px);
    vertical-align: top;
  }
  &-center {
    text-align: center
  }
  &-card {
    margin-top: 16px;
  }
}
</style>
