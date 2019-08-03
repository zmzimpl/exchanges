<template>
  <div class="moving-container">
    <el-row :gutter="24">
      <el-col :xs="24" :xl="16" :span="16">
        <el-card v-for="(moveForm, moveIndex) in moves" :key="moveIndex" :class="{ 'moving-card' : moveIndex !== 0 }">
          <div slot="header" class="clearfix">
            <div class="moving-center">
              <span>当前交易对：</span>
              <span>收益：</span>
            </div>
          </div>
          <el-form :ref="moveIndex" :model="moveForm" label-width="100px" class="moving-form">
            <el-form-item
              prop="currency"
              label="交易对"
              :rules="[
                { required: true, message: '请选择交易对', trigger: 'change' }
              ]"
            >
              <el-select v-model="moveForm.currency" placeholder="请选择交易对" class="moving-select">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
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
              <el-button type="primary" @click="submitForm('moveForm')">开始</el-button>
              <el-button @click="addAccount(moveForm)">新增API账号</el-button>
              <el-button type="danger" v-if="moves.length > 1" @click="removeForm(moveIndex)">删除</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :xs="0" :xl="8" :span="8">
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
    <el-row type="flex" justify="center">
      <el-col :span="16" class="moving-center" style="margin: 24px 0">
        <el-button round style="width: 40%" @click="addMove()">
          <i class="el-icon-plus" /> 新建
        </el-button>
      </el-col>
      <el-col :span="8" />
    </el-row>
  </div>
</template>

<script>

import { exchanges } from '@/models/exchanges'

export default {
  data() {
    return {
      options: [],
      apiAccounts: exchanges,
      moves: [{
        accounts: [{
          key: Date.now(),
          value: []
        }],
        currency: ''
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
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          alert('submit!')
        } else {
          console.log('error submit!!')
          return false
        }
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
        currency: ''
      })
    },
    // 根据交易所ID获取已添加的账号信息
    getAccountsById(id) {
      console.log(id)
        let tempAccounts = localStorage.getItem(id)
        if (!tempAccounts) {
          tempAccounts = []
        } else {
          tempAccounts = JSON.parse(tempAccounts).map(item => {
            item.id = item.apiKey
            return item
          })
        }
        console.log(tempAccounts)
        return tempAccounts
    },
    accountChecked(checked) {
      console.log(checked)
    }
  },
  created() {
    this.apiAccounts.forEach(item => {
      item.accounts = this.getAccountsById(item.id);
    })
  }
}
</script>

<style lang="scss" scoped>
.moving {
  &-container {
    margin: 30px;
  }
  &-form {
    width: 80%;
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
