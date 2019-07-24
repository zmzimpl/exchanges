<template>
  <div class="moving-container">
    <el-row :gutter="24">
      <el-col :xs="24" :xl="16" :span="16">
        <el-card v-for="(moveForm, moveIndex) in moves" :key="moveIndex" :class="{ 'moving-card' : moveIndex !== 0 }">
          <div slot="header" class="clearfix">
            <div class="moving-center">
              <span>当前币种：</span>
              <span>收益：</span>
            </div>
          </div>
          <el-form :ref="moveIndex" :model="moveForm" label-width="100px" class="moving-form">
            <el-form-item
              prop="currency"
              label="币种"
              :rules="[
                { required: true, message: '请选择币种', trigger: 'change' }
              ]"
            >
              <el-select v-model="moveForm.currency" placeholder="请选择交易币种" class="moving-select">
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
              <el-cascader v-model="account.value" :options="apiAccounts" class="moving-select" />
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

export default {
  data() {
    return {
      dynamicValidateForm: {
        accounts: [{
          key: Date.now(),
          value: []
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
      }],
      apiAccounts: [{
        value: 'zhinan',
        label: '指南',
        disabled: true,
        children: [{
          value: 'shejiyuanze',
          label: '设计原则',
          children: [{
            value: 'yizhi',
            label: '一致'
          }, {
            value: 'fankui',
            label: '反馈'
          }, {
            value: 'xiaolv',
            label: '效率'
          }, {
            value: 'kekong',
            label: '可控'
          }]
        }, {
          value: 'daohang',
          label: '导航',
          children: [{
            value: 'cexiangdaohang',
            label: '侧向导航'
          }, {
            value: 'dingbudaohang',
            label: '顶部导航'
          }]
        }]
      }, {
        value: 'zujian',
        label: '组件',
        children: [{
          value: 'basic',
          label: 'Basic',
          children: [{
            value: 'layout',
            label: 'Layout 布局'
          }, {
            value: 'color',
            label: 'Color 色彩'
          }, {
            value: 'typography',
            label: 'Typography 字体'
          }, {
            value: 'icon',
            label: 'Icon 图标'
          }, {
            value: 'button',
            label: 'Button 按钮'
          }]
        }, {
          value: 'form',
          label: 'Form',
          children: [{
            value: 'radio',
            label: 'Radio 单选框'
          }, {
            value: 'checkbox',
            label: 'Checkbox 多选框'
          }, {
            value: 'input',
            label: 'Input 输入框'
          }, {
            value: 'input-number',
            label: 'InputNumber 计数器'
          }, {
            value: 'select',
            label: 'Select 选择器'
          }, {
            value: 'cascader',
            label: 'Cascader 级联选择器'
          }, {
            value: 'switch',
            label: 'Switch 开关'
          }, {
            value: 'slider',
            label: 'Slider 滑块'
          }, {
            value: 'time-picker',
            label: 'TimePicker 时间选择器'
          }, {
            value: 'date-picker',
            label: 'DatePicker 日期选择器'
          }, {
            value: 'datetime-picker',
            label: 'DateTimePicker 日期时间选择器'
          }, {
            value: 'upload',
            label: 'Upload 上传'
          }, {
            value: 'rate',
            label: 'Rate 评分'
          }, {
            value: 'form',
            label: 'Form 表单'
          }]
        }, {
          value: 'data',
          label: 'Data',
          children: [{
            value: 'table',
            label: 'Table 表格'
          }, {
            value: 'tag',
            label: 'Tag 标签'
          }, {
            value: 'progress',
            label: 'Progress 进度条'
          }, {
            value: 'tree',
            label: 'Tree 树形控件'
          }, {
            value: 'pagination',
            label: 'Pagination 分页'
          }, {
            value: 'badge',
            label: 'Badge 标记'
          }]
        }, {
          value: 'notice',
          label: 'Notice',
          children: [{
            value: 'alert',
            label: 'Alert 警告'
          }, {
            value: 'loading',
            label: 'Loading 加载'
          }, {
            value: 'message',
            label: 'Message 消息提示'
          }, {
            value: 'message-box',
            label: 'MessageBox 弹框'
          }, {
            value: 'notification',
            label: 'Notification 通知'
          }]
        }, {
          value: 'navigation',
          label: 'Navigation',
          children: [{
            value: 'menu',
            label: 'NavMenu 导航菜单'
          }, {
            value: 'tabs',
            label: 'Tabs 标签页'
          }, {
            value: 'breadcrumb',
            label: 'Breadcrumb 面包屑'
          }, {
            value: 'dropdown',
            label: 'Dropdown 下拉菜单'
          }, {
            value: 'steps',
            label: 'Steps 步骤条'
          }]
        }, {
          value: 'others',
          label: 'Others',
          children: [{
            value: 'dialog',
            label: 'Dialog 对话框'
          }, {
            value: 'tooltip',
            label: 'Tooltip 文字提示'
          }, {
            value: 'popover',
            label: 'Popover 弹出框'
          }, {
            value: 'card',
            label: 'Card 卡片'
          }, {
            value: 'carousel',
            label: 'Carousel 走马灯'
          }, {
            value: 'collapse',
            label: 'Collapse 折叠面板'
          }]
        }]
      }, {
        value: 'ziyuan',
        label: '资源',
        children: [{
          value: 'axure',
          label: 'Axure Components'
        }, {
          value: 'sketch',
          label: 'Sketch Templates'
        }, {
          value: 'jiaohu',
          label: '组件交互文档'
        }]
      }],
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
      this.moves.splice(moveIndex, 1);
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
