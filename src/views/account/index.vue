<template>
  <div class="account-container">
    <el-container>
      <el-header class="account-header">
        <el-radio-group
          v-model="currentExchange"
          style="margin-bottom: 30px;"
          @change="getAccountsById(currentExchange)"
        >
          <el-radio-button v-for="item in exchanges" :key="item.id" :label="item.id">
            <img :src="item.logo" class="account-exchanges-logo" />
            {{ item.name }}
          </el-radio-button>
        </el-radio-group>
      </el-header>
      <el-main>
        <el-row :gutter="20" class="account-row">
          <el-col :span="4" class="account-card">
            <el-card
              class="box-card"
              :body-style="{ padding: '20px', overflow: 'auto', height: 'calc(100% - 80px)' }"
            >
              <div slot="header" class="clearfix">
                <span>账号</span>
                <el-button
                  style="float: right; padding: 3px 0; color: red"
                  type="text"
                  @click="resetAccounts()"
                >
                  <i class="el-icon-delete" /> 清空
                </el-button>
                <el-button
                  style="float: right; padding: 3px 0; margin-right: 8px"
                  type="text"
                  @click="createAccount()"
                >
                  <i class="el-icon-plus" /> 添加
                </el-button>
              </div>
              <div class="text item">
                <ul class="infinite-list">
                  <li
                    v-for="item in accounts"
                    :key="item.name"
                    @click="getAccountInfo(item)"
                    class="infinite-list-item"
                  >{{ item.name }}</li>
                </ul>
              </div>
            </el-card>
          </el-col>
          <el-col :span="20" class="account-card">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span v-if="currentAccount">当前帐号：{{ currentAccount ? currentAccount.name : '' }}</span>
                <el-button
                  v-if="currentAccount"
                  style="padding: 3px 0; margin-left: 8px;"
                  type="text"
                  @click="editAccount(currentAccount)"
                >
                  <i class="el-icon-edit" />
                </el-button>
                <el-button
                  v-if="currentAccount"
                  style="padding: 3px 0; color: red"
                  type="text"
                  @click="deleteAccount()"
                >
                  <i class="el-icon-delete" />
                </el-button>
                <el-button style="float: right; padding: 3px 0; color: grey" type="text">
                  <i class="el-icon-refresh" />
                  {{ timer }} 秒后自动刷新
                </el-button>
                <el-checkbox style="float: right; padding: 3px 0;" v-model="hideZero" @change="isHideZero()">不显示小额币种</el-checkbox>
              </div>
              <div class="text item">
                <el-card
                  v-if="!accounts.length"
                  shadow="hover"
                  style="text-align: center; cursor: pointer;"
                  @click.native="createAccount()"
                >
                  <svg-icon icon-class="user" style="width: 128px; height: 128px;  color: #409EFF" />
                  <div style="padding: 14px;">
                    <span>还没有账号，添加一个吧</span>
                  </div>
                </el-card>

                <el-table
                  v-loading="balancesLoading"
                  v-if="accounts.length"
                  :data="balances"
                  :height="innerHeight - 300 + 'px'"
                  element-loading-text="数据获取中..."
                  size="small"
                  border
                  fit
                  highlight-current-row
                >
                  <el-table-column
                    prop="coinName"
                    align="center"
                    label="币种">
                  </el-table-column>
                  <el-table-column
                    prop="free"
                    align="center"
                    label="可用">
                  </el-table-column>
                  <el-table-column
                    prop="used"
                    align="center"
                    label="冻结">
                  </el-table-column>
                  <el-table-column
                    prop="total"
                    align="center"
                    label="总额">
                  </el-table-column>
                  <el-table-column
                    prop="value"
                    align="center"
                    label="价值(USDT)">
                  </el-table-column>
                </el-table>
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
          <el-input v-model="form.secretKey" autocomplete="off" show-password />
        </el-form-item>
        <el-form-item label="password" :label-width="formLabelWidth" prop="password">
          <el-input v-model="form.password" autocomplete="off" show-password />
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
import { mapGetters } from "vuex";
import { exchanges } from "@/models/exchanges";
import { getList } from "../../api/table";
import { clearInterval } from "timers";
import { UUID } from "../../utils/uuid";

const ccxt = require ('ccxt')

export default {
  name: "Dashboard",
  data() {
    return {
      innerHeight: innerHeight,
      exchanges: exchanges,
      currentAccount: null,
      currentExchange: "huobipro",
      accounts: [],
      allBalances: [],
      balances: [],
      balancesLoading: false,
      hideZero: true,
      timer: 60,
      timerId: null,
      dialogFormVisible: false,
      form: {
        id: "",
        name: "",
        apiKey: "",
        secretKey: ""
      },
      formLabelWidth: "120px",
      rules: {
        id: [{ required: false }],
        name: [{ required: true, message: "请输入Api名称", trigger: "change" }],
        apiKey: [
          { required: true, message: "请输入apiKey", trigger: "change" }
        ],
        secretKey: [
          { required: true, message: "请输入secretKey", trigger: "change" }
        ],
        password: [
          { required: false, message: "部分交易所如OKEx的API需要支付密码", trigger: "change" }
        ]
      },
      ccxt: null,
      exchange: null
    };
  },
  computed: {
    ...mapGetters(["name"])
  },
  mounted() {
    this.getAccountsById(this.currentExchange);
    window.onresize = () => {
      this.innerHeight = innerHeight
    }
  },
  destroyed() {
    if (this.timerId) window.clearInterval(this.timerId)
  },
  methods: {
    // 根据交易所ID获取已添加的账号信息
    getAccountsById(id) {
      let tempAccounts = localStorage.getItem(id);
      if (!tempAccounts) {
        tempAccounts = [];
        this.currentAccount = null;
      } else {
        tempAccounts = JSON.parse(tempAccounts);
      }
      this.accounts = tempAccounts;
      if (this.timerId) window.clearInterval(this.timerId)
      if (this.accounts.length) {
        this.allBalances = []
        this.balances = []
        this.getAccountInfo(this.accounts[0])
      }
    },
    // 根据当前交易所的账号信息获取钱包余额
    getBalanceByAccountInfo() {
      if (this.currentAccount) {
        this.exchange = new ccxt[this.currentExchange]({enableRateLimit: true, 'options': { 'adjustForTimeDifference': true }});
        this.exchange.apiKey = this.currentAccount.apiKey;
        this.exchange.secret = this.currentAccount.secretKey;
        this.exchange.password = this.currentAccount.password ? this.currentAccount.password : undefined;
        (async () => {
          this.balancesLoading = true;
          this.allBalances = [];
          this.balances = [];
          this.exchange.fetchBalance().then(rs => {
            this.exchange.fetchTickers().then(tickers => {
              for (const key in rs) {
                if (rs.hasOwnProperty(key)) {
                  const coin = rs[key];
                  if (coin.hasOwnProperty('free')) {
                    this.allBalances.push({
                      coinName: key,
                      free: coin.free,
                      used: coin.used,
                      total: coin.total,
                      value: tickers[key + '/USDT'] ? tickers[key + '/USDT'].last * coin.total : ''
                    })
                  }
                }
              }
              this.balances = this.hideZero ? this.allBalances.filter(f => f.value > 1) : this.allBalances
              this.balancesLoading = false;
            })
          }).catch(err => {
            this.allBalances = []
            this.balances = []
            this.balancesLoading = false;
            if (err.toString().indexOf('request timed out') > -1) {
              this.$message({
                type: "error",
                message: "请求超时，请检测你的网络"
              });
            } else {
              this.$message({
                type: "error",
                message: err.toString()
              });
            }
          })
        })();
      }
    },
    createAccount() {
      this.dialogFormVisible = true
      this.initForm()
      setTimeout(() => {
        this.$refs["rulesForm"].resetFields()
      }, 0);
    },
    editAccount(account) {
      if (account) {
        this.form = { ...account };
        this.dialogFormVisible = true;
      }
    },
    deleteAccount() {
      this.$confirm(`是否确定删除当前API账号?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.accounts = this.accounts.filter(
          item => item.name !== this.currentAccount.name
        );
        localStorage.setItem(
          this.currentExchange,
          JSON.stringify(this.accounts)
        );
        if (this.accounts.length) {
          this.currentAccount = this.accounts[0];
          this.reload();
        } else {
          this.currentAccount = null;
        }
      });
    },
    // 账号管理
    setAccounts(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let isEdit = false;
          if ((find = this.accounts.find(f => f.id === this.form.id))) {
            Object.assign(find, this.form);
            isEdit = true;
          } else {
            this.accounts = [...this.accounts, { ...this.form }];
            isEdit = false;
          }
          localStorage.setItem(
            this.currentExchange,
            JSON.stringify(this.accounts)
          );
          this.$message({
            type: "success",
            message: isEdit ? "修改账号成功" : "添加账号成功"
          });
          this.currentAccount = this.form;
          this.dialogFormVisible = false;
        } else {
          this.$message({
            type: "warning",
            message: "请完善账号信息"
          });
          return false;
        }
      });
    },
    // 清空当前交易所已保存的账号信息
    resetAccounts() {
      this.$confirm(`是否确定清空当前交易所的所有API账号?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          localStorage.removeItem(this.currentExchange);
          this.accounts = [];
          this.currentAccount = null;
          this.$message({
            type: "success",
            message: "清空成功!"
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消清空"
          });
        });
    },
    // 初始化表单
    initForm() {
      this.form = {
        id: UUID(),
        name: "",
        apiKey: "",
        secretKey: ""
      };
    },
    // 设置当前账号
    getAccountInfo(account) {
      this.currentAccount = account;
      this.getBalanceByAccountInfo()
      this.reload();
    },
    // 刷新钱包
    reload() {
      if (this.timerId) {
        window.clearInterval(this.timerId);
        this.timer = 60
      }
      this.timerId = setInterval(() => {
        this.timer--;
        if (this.timer === 0) {
          this.getBalanceByAccountInfo()
          this.timer = 60;
        }
      }, 1000);
    },
    isHideZero() {
      this.hideZero ? this.balances = this.allBalances.filter(f => f.total) : this.balances = this.allBalances
    }
  }
};
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
.infinite-list-item:hover {
  box-shadow: 0 0 8px 0 rgba(232, 237, 250, 0.6),
    0 2px 4px 0 rgba(232, 237, 250, 0.5);
}
.account /deep/ .el-card__body {
  height: calc(100% - 100px);
  overflow: auto;
}
</style>
