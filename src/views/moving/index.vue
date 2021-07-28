<template>
  <div class="moving-container">
    <div>
      <el-form :model="config">
        <el-form-item label="搬砖利润率(%)" :label-width="'120px'" prop="minProfix">
          <el-input-number v-model="config.minProfix" :precision="1" :step="0.1" :max="100"></el-input-number>
        </el-form-item>
      </el-form>
    </div>
    <el-row :gutter="24">
      <el-col :span="13" :sm="24" :xs="24" :md="16" >
        <el-card v-for="(moveForm, moveIndex) in moves" :key="moveIndex" :ref="'card' + moveIndex" :class="{ 'moving-card' : moveIndex !== 0 }">
          <div slot="header" class="clearfix">
            <div class="moving-center">
              <span>当前交易对：<span class="text-primary"> {{ moveForm.transaction }} </span> </span>
              <span>收益：<span class="text-success"> {{ moveForm.profit + '%' }} </span> </span>
            </div>
          </div>
          <el-col :xs="24" :sm="24" :md="14" :span="24">
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
              <el-form-item class="moving-center" label-width="0">
                <el-button type="primary" @click="startMove(moveIndex, moveForm, 'log' + moveIndex)">{{ !moveForm.isStarted ? '开始' : '暂停' }}</el-button>
                <el-button @click="addAccount(moveForm)">新增API账号</el-button>
                <el-button type="danger" v-if="moves.length > 1" @click="removeForm(moveIndex)">删除</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :xs="24" :sm="24" :md="10" :span="10">
            <el-card :ref="'log' + moveIndex" :body-style="{ overflow: 'auto', height: moveForm.accounts.length > 2 ? (moveForm.accounts.length * 60) + 'px' : '180px' }">
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
      <el-col :span="11" :sm="24" :xs="24" :md="8" >
        <el-table
          :data="tableData"
          stripe
          border
          height="500"
          style="width: 100%">
          <el-table-column
            prop="transaction"
            label="交易对"
            width="100">
          </el-table-column>
          <el-table-column
            prop="profit"
            label="盈利(%)">
          </el-table-column>
          <el-table-column
            prop="amount"
            label="交易数量"
            width="200">
          </el-table-column>
          <el-table-column
            prop="exchange"
            label="交易所"
            width="200">
          </el-table-column>
          <el-table-column
            prop="date"
            label="时间"
            width="140">
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>

import { getExchanges } from '@/models/exchanges'
import customConfig from '@/assets/tmp/app-data.json'

const ccxt = require ('ccxt')

export default {
  data() {
    return {
      config: {
        minProfix: 0.7
      },
      transactions: customConfig.transactions,
      apiAccounts: getExchanges(),
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
        count: 0,
        maxBuy: null,
        minSell: null,
      }],
      tableData: []
    }
  },
  methods: {
    startMove(formName, model, logRef) {
      if (model.transaction && model.accounts.every(item => item.value)) {
        // scrollIntoView
        const ref = this.$refs[logRef][0].$el.childNodes[1]
        model.isStarted = !model.isStarted;
        if (model.isStarted) {
          this.autoMove(model, ref);
        } else {
          this.clearTimer(model.timerId)
        }
      }
    },
    clearTimer(timerId) {
      if (timerId) {
        window.clearTimeout(timerId)
      } else {
        console.log(this.moves);
        this.moves.forEach(item => {
          if (item.timerId) {
            window.clearTimeout(item.timerId)
          }
        })
      }
    },
    autoMove(model, logRef) {
      model.timerId = setTimeout(() => {
        model.logs.push({msg: '-', color: 'blue'})
        model.logs.push({msg: '第' + ++model.count + '次请求...', color: 'blue'})
        model.maxBuy = null;
        model.minSell = null;
        model.accounts.forEach((item, index) => {
          const account = this.getAccountsById(item.value[0]).find(f => f.id === item.value[1])
          if (!model[item.value[0]]) {
            model[item.value[0]] = new ccxt[item.value[0]]({...account, enableRateLimit: true, 'options': { 'adjustForTimeDifference': true }})
          };
        });
        this.asyncFun(model, 0, logRef)
      }, model.count === 0 ? 0 : 3000);
    },
    asyncFun(model, index, logRef) {
      const item = model.accounts[index];
      (async () => {
        let params = null;
        if (item.value[0] === 'huobipro') {
          params = { depth: 10, type: 'step2' };
        } else if (item.value[0] === 'okex3') {
          params = { depth: 1 }
        } else if (item.value[0] === 'gateio') {
          params = { decimal_places: 0, int: 10 };
        }
        model[item.value[0]].fetchOrderBook(model.transaction, 10, params).then(rs => {
          if (model.logs.length > 200) model.logs = [];
          model.logs.push({msg: item.value[0] + '： 买一：' + rs.bids[0][0] + '; 数量' + rs.bids[0][1], color: this.randomColor()})
          model.logs.push({msg: item.value[0] + '： 卖一：' + rs.asks[0][0] + '; 数量' + rs.asks[0][1], color: this.randomColor()})
          if (model.maxBuy) {
            if (rs.bids[0][0] > model.maxBuy.size) model.maxBuy = { name: item.value[0], size: rs.bids[0][0], volume: rs.bids[0][1] }
          } else {
            model.maxBuy = { name: item.value[0], size: rs.bids[0][0], volume: rs.bids[0][1] }
          }
          if (model.minSell) {
            if (rs.asks[0][0] < model.minSell.size) model.minSell = { name: item.value[0], size: rs.asks[0][0], volume: rs.asks[0][1] }
          } else {
            model.minSell = { name: item.value[0], size: rs.asks[0][0], volume: rs.asks[0][1] }
          }
          if (index === (model.accounts.length - 1)) {
            this.autoMove(model, logRef);
            model.logs.push({msg: ' ', color: this.randomColor()})
            model.logs.push({msg: '最大买单：' + model.maxBuy.name + '：' + model.maxBuy.size + `(${model.maxBuy.volume})`, color: this.randomColor()})
            model.logs.push({msg: '最小卖单：' +　model.minSell.name + '：' + model.minSell.size + `(${model.minSell.volume})`, color: this.randomColor()})
            model.logs.push({msg: '差价' + ((model.maxBuy.size - model.minSell.size).toFixed(2) + 'U'), color: this.randomColor()})
            model.logs.push({msg: '成交利润：' + ((model.maxBuy.size - model.minSell.size)/model.minSell.size *　100).toFixed(2) + '%' , color: this.randomColor()})
            model.logs.push({msg: ' ', color: this.randomColor()})
            if (+(((model.maxBuy.size - model.minSell.size)/model.minSell.size *　100).toFixed(2)) > this.config.minProfix) {
              this.saveProfitLog(model);
            }
          } else {
            if (logRef.scrollHeight > logRef.clientHeight) {
              logRef.scrollTo(0, logRef.scrollHeight + 240);
            }
            this.asyncFun(model, index + 1, logRef)
          }
        }).catch(reason => {
          model.logs.push({msg: '请求失败，重新尝试...', color: 'red'})
          this.autoMove(model, logRef);
        })
      })();
    },
    saveProfitLog(model) {  // 本地保存搬砖记录
      const date = new Date();
      const amount = model.maxBuy.volume > model.minSell.volume ? model.minSell.volume : model.maxBuy.volume;
      this.tableData = [...this.tableData, {
        date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes(),
        exchange: model.maxBuy.name + '卖出， ' + model.minSell.name + '买入',
        profit: ((model.maxBuy.size - model.minSell.size)/model.minSell.size *　100).toFixed(2),
        amount: amount,
        transaction: model.transaction
      }]
      localStorage.setItem('profitData', JSON.stringify(this.tableData))
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
        },{
          key: Date.now() + 100,
          value: []
        }],
        transaction: '',
        profit: 0,
        logs: [],
        isStarted: false,
        timerId: null,
        count: 0,
        maxBuy: null,
        minSell: null,
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
    const temp = localStorage.getItem('profitData')
    temp ? this.tableData = JSON.parse(temp) : this.tableData = [];
  },
  beforeDestroy() {
    this.clearTimer();
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
