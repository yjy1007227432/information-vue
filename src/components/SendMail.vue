<template>
  <el-form>
    <h3 class="login_title">邮件发送</h3>
    <el-form-item prop="account1">
      <el-input type="text" v-model="loginForm.address" auto-complete="off" placeholder="邮件地址"></el-input>
    </el-form-item>
    <el-form-item prop="account2">
      <el-input type="text" v-model="loginForm.title" auto-complete="off" placeholder="邮件主题"></el-input>
    </el-form-item>
    <el-form-item prop="account3">
      <el-input type="text" v-model="loginForm.content" auto-complete="off" placeholder="邮件内容"></el-input>
    </el-form-item>
    <el-form-item style="width: 100%">
      <el-button type="primary" @click.native.prevent="submitClick" style="width: 100%">发送</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
    import {postRequest} from '../utils/api'
    import {getRequest} from '../utils/api'
    import {putRequest} from '../utils/api'
    export default{
        data(){
            return {
                rules: {
                    account1: [{required: true, message: '请输入邮箱地址', trigger: 'blur'}],
                    account2: [{required: true, message: '请输入邮件主题', trigger: 'blur'}],
                    account3: [{required: true, message: '请输入邮件内容', trigger: 'blur'}]
                },
                checked: true,
                loginForm: {
                    address: '1007227432',
                    title: '测试邮件',
                    content: '这是一封测试邮件',
                },
                loading: false
            }
        },
        methods: {
            submitClick: function () {
                var _this = this;
                this.loading = true;
                getRequest('/sendEmail/'+this.loginForm.address+"    "+this.loginForm.title + "    " + this.loginForm.content
                ).then(resp=> {
                    _this.loading = false;
                    if (resp.status == 200) {
                        //成功
                        var json = resp.data;
                        if (json.status == 'success') {
                            _this.$router.replace({path: '/home'});
                        } else {
                            _this.$alert('发送成功!', '成功啦!');
                        }
                    } else {
                        //失败
                        _this.$alert('发送失败!', '失败!');
                    }
                }, resp=> {
                    _this.loading = false;
                    _this.$alert('找不到服务器⊙﹏⊙∥!', '失败!');
                });
            }
        }
    }
</script>
