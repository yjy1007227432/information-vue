<template>
  <el-container class="article_list">
    <el-main class="main">
      <el-tabs v-model="activeName" @tab-click="handleClick" type="card">
        <el-tab-pane label="全部竞争信息" name="all">
          <info-table state="-1" :showEdit="false" :showDelete="false" :activeName="activeName"></info-table>
        </el-tab-pane>
        <el-tab-pane label="已发表" name="post">
          <info-table state="1" :showEdit="true" :showDelete="true" :activeName="activeName"></info-table>
        </el-tab-pane>
        <el-tab-pane label="草稿箱" name="draft">
          <info-table state="0" :showEdit="true" :showDelete="true" :activeName="activeName"></info-table>
        </el-tab-pane>
        <el-tab-pane label="回收站" name="dustbin">
          <info-table state="2" :showEdit="false" :showDelete="true" :activeName="activeName"></info-table>
        </el-tab-pane>
        <el-tab-pane label="竞争信息管理" name="blogmana">
          <info-table state="-2" :showEdit="false" :showDelete="true" :activeName="activeName"></info-table>
        </el-tab-pane>
        <el-tab-pane label="系统配置" name="blogcfg">
          <blog_cfg></blog_cfg>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>
<script>
  import infoTable from './table'
  import BlogCfg from '@/components/BlogCfg'
  import {postRequest, putRequest,deleteRequest, getRequest} from '@/utils/api'
  export default {
    mounted: function () {
      var _this = this;
      getRequest("/isAdmin").then(resp=> {
        if (resp.status == 200) {
          _this.isAdmin = resp.data;
        }
      })
    },
    data() {
      return {
        activeName: 'all',
        isAdmin: false
      };
    },
    methods: {
      handleClick(tab, event) {
      //  console.log(tab, event);
      }
    },
    components: {
      'info-table': infoTable,
      'blog_cfg': BlogCfg
    }
  };
</script>
<style>
  .article_list > .header {
    background-color: #ececec;
    margin-top: 10px;
    padding-left: 5px;
    display: flex;
    justify-content: flex-start;
  }

  .article_list > .main {
    /*justify-content: flex-start;*/
    display: flex;
    flex-direction: column;
    padding-left: 0px;
    background-color: #fff;
    padding-top: 0px;
    margin-top: 8px;
  }
</style>
