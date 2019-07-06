<template>
  <div class="account-container">
    <el-container>
      <el-header class="account-header">
        <el-radio-group v-model="currentExchange" style="margin-bottom: 30px;" @change="getAccountsById(currentExchange)">
          <el-radio-button v-for="item in exchanges" :key="item.id" :label="item.id">
            <img :src="item.logo" class="account-exchanges-logo"> {{ item.name }}
          </el-radio-button>
        </el-radio-group>
      </el-header>
      <el-main>
        <el-row :gutter="20" class="account-row">
          <el-col :span="4" class="account-card">
            <el-card class="box-card" :body-style="{ padding: '20px', overflow: 'auto', height: 'calc(100% - 80px)' }">
              <div slot="header" class="clearfix">
                <span>账号</span>
                <el-button style="float: right; padding: 3px 0; color: red" type="text" @click="resetAccounts()">
                  <i class="el-icon-delete" /> 清空
                </el-button>
                <el-button style="float: right; padding: 3px 0; margin-right: 8px" type="text" @click="dialogFormVisible = true">
                  <i class="el-icon-plus" /> 添加
                </el-button>
              </div>
              <div class="text item">
                <ul class="infinite-list">
                  <li v-for="item in accounts" :key="item.name" class="infinite-list-item"> {{ item.name }} </li>
                </ul>
              </div>
            </el-card>
          </el-col>
          <el-col :span="20" class="account-card">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>钱包</span>
                <el-button style="float: right; padding: 3px 0; color: grey" type="text">
                  <i class="el-icon-refresh" /> 5 秒后自动刷新
                </el-button>
              </div>
              <div class="text item">
                <el-card v-if="!accounts.length" shadow="hover" style="text-align: center; cursor: pointer;" @click.native="dialogFormVisible = true">
                  <svg-icon icon-class="user" style="width: 128px; height: 128px;  color: #409EFF" />
                  <div style="padding: 14px;">
                    <span>还没有账号，添加一个吧</span>
                  </div>
                </el-card>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>

    <el-dialog title="添加账号" :visible.sync="dialogFormVisible" width="30%" top="25vh">
      <el-form ref="rulesForm" :model="form" :rules="rules">
        <el-form-item label="api名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="apiKey" :label-width="formLabelWidth" prop="apiKey">
          <el-input v-model="form.apiKey" autocomplete="off" />
        </el-form-item>
        <el-form-item label="secretKey" :label-width="formLabelWidth" prop="secretKey">
          <el-input v-model="form.secretKey" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="setAccounts('rulesForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { exchanges } from '@/models/exchanges'

export default {
  name: 'Dashboard',
  data() {
    return {
      exchanges: exchanges,
      currentExchange: 'coinex',
      accounts: [],
      dialogFormVisible: false,
      form: {
        name: '',
        apiKey: '',
        secretKey: ''
      },
      formLabelWidth: '120px',
      rules: {
        name: [
          { required: true, message: '请输入Api名称', trigger: 'change' }
        ],
        apiKey: [
          { required: true, message: '请输入apiKey', trigger: 'change' }
        ],
        secretKey: [
          { required: true, message: '请输入secretKey', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created() {
    this.getAccountsById(this.currentExchange)
  },
  methods: {
    // 根据交易所ID获取已添加的账号信息
    getAccountsById(id) {
      let tempAccounts = localStorage.getItem(id)
      if (!tempAccounts) {
        tempAccounts = []
      } else {
        tempAccounts = JSON.parse(tempAccounts)
      }
      this.accounts = tempAccounts
    },
    // 添加账号
    setAccounts(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.accounts.push(this.form)
          localStorage.setItem(this.currentExchange, JSON.stringify(this.accounts))
          this.$message({
            type: 'success',
            message: '添加账号成功'
          })
          this.dialogFormVisible = false
        } else {
          this.$message({
            type: 'warning',
            message: '请完善账号信息'
          })
          return false
        }
      })
    },
    // 清空当前交易所已保存的账号信息
    resetAccounts() {
      this.$confirm(`是否确定清空当前交易所的所有API账号?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem(this.currentExchange)
        this.accounts = []
        this.$message({
          type: 'success',
          message: '清空成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消清空'
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.account {
  &-container {
    height: calc(100% - 50px);
    position: absolute;
    width: calc(100% - 60px);
    margin: 30px;
  }
  &-exchanges-logo {
    width: 18px;
    height: 18px;
    vertical-align: -3px;
    margin-right: 5px;
  }
  &-header {
    text-align: right;
    font-size: 12px;
    padding: 0;
  }
  &-row {
    margin-left: -10px;
    margin-right: -10px;
    height: calc(100% - 100px);
    position: absolute;
    width: 100%;
  }
  &-card {
    height: 100%;
    display: inline-grid;
  }
}
.infinite-list {
  width: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
  overflow: auto;
}
.infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: #e8f3fe;
  margin: 10px;
  color: #7dbcfc;
  cursor: pointer;
}
.account /deep/ .el-card__body {
  height: calc(100% - 100px);
  overflow: auto;
}
</style>
