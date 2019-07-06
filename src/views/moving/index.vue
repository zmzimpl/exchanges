<template>
  <div class="moving-container">
    <el-row :gutter="24">
      <el-col :span="16">
        <div class="moving-grid-content">
          <el-form ref="dynamicValidateForm" :model="dynamicValidateForm" label-width="100px" class="moving-form">
            <el-form-item
              prop="currency"
              label="币种"
              :rules="[
                { required: true, message: '请选择币种', trigger: 'change' }
              ]"
            >
              <el-select v-model="dynamicValidateForm.currency" placeholder="请选择交易币种" class="moving-select">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              v-for="(account, index) in dynamicValidateForm.accounts"
              :key="account.key"
              :label="'API账号' + index"
              :prop="'accounts.' + index + '.value'"
              :rules="{
                required: true, message: 'API账号不能为空', trigger: 'blur'
              }"
            >
              <el-select v-model="dynamicValidateForm.currency" placeholder="请选择交易币种" class="moving-select">
                <el-option
                  v-for="account in options"
                  :key="account.value"
                  :label="account.label"
                  :value="account.value">
                </el-option>
              </el-select>
              <el-button @click="addAccount">新增API账号</el-button>
              <el-button @click.prevent="removeAccount(account)">删除</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm('dynamicValidateForm')">开始</el-button>
              <el-button @click="resetForm('dynamicValidateForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple-light">

        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>

export default {
  data() {
    return {
      dynamicValidateForm: {
        accounts: [{
          value: ''
        }],
        currency: ''
      },
      options: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
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
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    removeAccount(item) {
      var index = this.dynamicValidateForm.accounts.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm.accounts.splice(index, 1)
      }
    },
    addAccount() {
      this.dynamicValidateForm.accounts.push({
        value: '',
        key: Date.now()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.moving {
  &-container {
    margin: 30px;
  }
  &-form {
    width: 920px;
  }
  &-grid-content {
    padding: 24px;
    border: 1px solid #ebebeb;
    border-radius: 3px;
    transition: .2s;
  }
  &-select {
    margin-right: 10px;
    width: 540px;
    vertical-align: top;
  }
}
</style>
