<template>
  <el-container class="home_container">
    <el-header>
      <div class="home_title">信息收集系统</div>
      <div class="home_userinfoContainer">
        <el-dropdown @command="handleCommand">
  <span class="el-dropdown-link home_userinfo">
    {{currentUserName}}<i class="el-icon-arrow-down el-icon--right home_userinfo"></i>
  </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="sysMsg">系统消息</el-dropdown-item>
            <!-- <el-dropdown-item command="MyInformation">我的信息</el-dropdown-item>
            <el-dropdown-item command="MyHome">个人主页</el-dropdown-item> -->
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu
          default-active="0"
          class="el-menu-vertical-demo" style="background-color: #ECECEC" router>
          <template v-for="(item,index) in this.$router.options.routes" v-if="!item.hidden">
            <el-submenu :index="index+''" v-if="item.children.length>1" :key="index">
              <template slot="title">
                <i :class="item.iconCls"></i>
                <span>{{item.name}}</span>
              </template>
              <el-menu-item v-for="child in item.children" v-if="!child.hidden" :index="child.path" :key="child.path">
                {{child.name}}
              </el-menu-item>
            </el-submenu>
            <template v-else>
              <el-menu-item :index="item.children[0].path">
                <i :class="item.children[0].iconCls"></i>
                <span slot="title">{{item.children[0].name}}</span>
              </el-menu-item>
            </template>
          </template>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main>
          <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-text="this.$router.currentRoute.name"></el-breadcrumb-item>
          </el-breadcrumb>
          <div style="text-align: right;">
            <el-form :inline="true" :model="formInline" class="demo-form-inline">
              <el-form-item label="">
                <el-select v-model="formInline.value" placeholder="请选择">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="">
                <el-input v-model="formInline.keywords" placeholder="请输入内容"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSubmit">查询</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div>
            <el-table
              :data="articles"
              tooltip-effect="dark"
              style="width: 100%;overflow-x: hidden; overflow-y: hidden;"
              max-height="390"
              v-loading="loading">
              <el-table-column
                label="标题"
                align="left">
                <template slot-scope="scope"><span>{{ formInline.value=='information' ?scope.row.title:scope.row.strTitle}}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="总结"
                width=200px;
                align="left">
                <template slot-scope="scope"><span style="color: #409eff;cursor: pointer" @click="itemClick(scope.row)">{{ scope.row.summary}}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="产品"
                align="left">
                <template slot-scope="scope"><span>{{ scope.row.product}}</span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="formInline.value=='strategy'"
                label="策略效果"
                align="left">
                <template slot-scope="scope"><span>{{ scope.row.income}}</span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="formInline.value=='information'"
                label="来源"
                align="left">
                <template slot-scope="scope"><span>{{ scope.row.source}}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="重要性"
                align="left">
                <template slot-scope="scope"><span>{{ scope.row.alarm}}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="上传者" width="50px" align="left">
                <template slot-scope="scope">{{ scope.row.nickname}}</template>
              </el-table-column>
              <el-table-column
                label="上传时间" width="80px" align="left">
                <template slot-scope="scope">{{ scope.row.editTime | formatDateTime}}</template>
              </el-table-column>
              <el-table-column
                prop="cateName"
                label="所属分类"
                width="120" align="left">
              </el-table-column>
            </el-table>
            <el-pagination
              background
              :page-size="pageSize"
              layout="prev, pager, next"
              :total="totalCount" @current-change="currentChange" v-if="articles&&articles.length>0">
            </el-pagination>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>
<script>
  import {getRequest} from '../utils/api'
  export default{
    methods: {
      //翻页
      currentChange(currentPage){
        this.currentPage = currentPage;
        this.loading = true;
        this.loadBlogs(currentPage, this.pageSize);
      },
      loadBlogs(page, count){
        var _this = this;
        var url = `${_this.formInline.value}/all?state=-1&page=${page}&count=${count}&keywords=${_this.formInline.keywords}`;
        
        getRequest(url).then(resp=> {
          _this.loading = false;
          if (resp.status == 200) {
            _this.articles = _this.formInline.value=='information' ? resp.data.informations : resp.data.strategy;
            _this.totalCount = resp.data.totalCount;
          } else {
            _this.$message({type: 'error', message: '数据加载失败!'});
          }
        }, resp=> {
          _this.loading = false;
          if (resp.response.status == 403) {
            _this.$message({type: 'error', message: resp.response.data});
          } else {
            _this.$message({type: 'error', message: '数据加载失败!'});
          }
        }).catch(resp=> {
          //压根没见到服务器
          _this.loading = false;
          _this.$message({type: 'error', message: '数据加载失败!'});
        })
      },
      onSubmit() {
        this.loadBlogs(1, 6);
      },
      handleCommand(command){
        var _this = this;
        if (command == 'logout') {
          this.$confirm('注销登录吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(function () {
            getRequest("/logout")
            _this.currentUserName = '游客';
            _this.$router.replace({path: '/'});
          }, function () {
            //取消
          })
        }
      }
    },
    mounted: function () {
      
      var _this = this;
      getRequest("/currentUserName").then(function (msg) {
        _this.currentUserName = msg.data;
      }, function (msg) {
        _this.currentUserName = '游客';
      });
      this.loading = true;
      this.loadBlogs(1, 6);
    },
    data(){
      return {
        currentUserName: '',
        options: [{
          value: 'information',
          label: '竞争信息'
        }, {
          value: 'strategy',
          label: '策略'
        }],
        formInline: {
          value: 'information',
          keywords: ''
        },
        articles: [],
        loading: false,
        totalCount: 0,
        pageSize: 6,
        currentPage: 1
      }
    }
  }
</script>
<style>
  .home_container {
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
  }

  .el-header {
    background-color: #20a0ff;
    color: #333;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .el-aside {
    background-color: #ECECEC;
  }

  .el-main {
    background-color: #fff;
    color: #000;
    text-align: center;
  }

  .home_title {
    color: #fff;
    font-size: 22px;
    display: inline;
  }

  .home_userinfo {
    color: #fff;
    cursor: pointer;
  }

  .home_userinfoContainer {
    display: inline;
    margin-right: 20px;
  }
</style>
