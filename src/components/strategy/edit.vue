<template>
  <el-container v-loading="loading" class="post-article">
    <el-header class="header">
      <el-select v-model="article.iid" placeholder="请选择竞争信息" style="width: 150px;">
        <el-option
          v-for="item in categories"
          :key="item.id"
          :label="item.title"
          :value="item.id">
        </el-option>
      </el-select>
      <el-input v-model="article.strTitle" placeholder="标题" style="width: 200px;margin-left: 10px"></el-input>
      <el-input v-model="article.income" placeholder="策略效果" style="width: 200px;margin-left: 10px"></el-input>
    </el-header>
    <el-main class="main">
      
      <ul>
        <li v-for="(item,index) in strategyFile" :key="index" class="link">{{item.src.split('/').slice(-1)[0]}}</li>
      </ul>
      <div id="editor">
        <mavon-editor style="height: 100%;width: 100%;" ref=md @imgAdd="imgAdd" :subfield="false"
                      @imgDel="imgDel" v-model="article.mdContent"></mavon-editor>
      </div>
      <div style="display: flex;align-items: center;margin-top: 15px;justify-content: flex-end">
        <el-button @click="cancelEdit" v-if="from!=undefined">放弃修改</el-button>
        <template v-if="from==undefined || from=='draft'">
          <el-button @click="saveBlog(0)">保存到草稿箱</el-button>
          <el-button type="primary" @click="saveBlog(1)">发表文章</el-button>
        </template>
        <template v-else="from==post">
          <el-button type="primary" @click="saveBlog(1)">保存修改</el-button>
        </template>
      </div>
    </el-main>
  </el-container>
</template>
<script>
  import {postRequest,putRequest,deleteRequest,getRequest,uploadFileRequest,uploadPdf} from '@/utils/api'
  // Local Registration
  import {mavonEditor} from 'mavon-editor'
  // 可以通过 mavonEditor.markdownIt 获取解析器markdown-it对象
  import 'mavon-editor/dist/css/index.css'
  import {isNotNullORBlank} from '@/utils/utils'

  export default {
    mounted: function () {
      this.getCategories();
      var from = this.$route.query.from;
      this.from = from;
      var _this = this;
      if (from != null && from != '' && from != undefined) {
        var id = this.$route.query.id;
        this.id = id;
        this.loading = true;
        getRequest("/strategy/" + id).then(resp=> {
          _this.loading = false;
          if (resp.status == 200) {
            _this.article = resp.data;

            let strategyFile = resp.data.strategyFile
            if (strategyFile) {
              strategyFile = strategyFile.split(',')
              strategyFile.forEach((item,index) => {
                _this.strategyFile.push({id: index, src: item})
              })
            }
            
          } else {
            _this.$message({type: 'error', message: '页面加载失败!'})
          }
        }, resp=> {
          _this.loading = false;
          _this.$message({type: 'error', message: '页面加载失败!'})
        })
      }
    },
    components: {
      mavonEditor
    },
    methods: {
      cancelEdit(){
        this.$router.go(-1)
      },
      saveBlog(state){
        if (!(isNotNullORBlank(this.article.strTitle, this.article.mdContent, this.article.iid))) {
          this.$message({type: 'error', message: '数据不能为空!'});
          return;
        }
        var _this = this;
        _this.loading = true;
        
        let strategyFile = []
        _this.strategyFile.forEach(item => {
          strategyFile.push(item.src)
        })
        postRequest("/strategy/", {
          id: _this.article.id,
          strTitle: _this.article.strTitle,
          mdContent: _this.article.mdContent,
          htmlContent: _this.$refs.md.d_render,
          iid: _this.article.iid,
          state: state,
          income: _this.article.income,
          strategyFile: strategyFile.join(',')
        }).then(resp=> {
          _this.loading = false;
          if (resp.status == 200 && resp.data.status == 'success') {
            _this.article.id = resp.data.msg;
            _this.$message({type: 'success', message: state == 0 ? '保存成功!' : '发布成功!'});
//            if (_this.from != undefined) {
            window.bus.$emit('blogTableReload')
//            }
            if (state == 1) {
              _this.$router.replace({path: '/strategylist'});
            }
          }
        }, resp=> {
          _this.loading = false;
          _this.$message({type: 'error', message: state == 0 ? '保存草稿失败!' : '策略发布失败!'});
        })
      },
      imgAdd(pos, $file){
        var _this = this;
        // 第一步.将图片上传到服务器.
        var formdata = new FormData();
        formdata.append('file', $file);
        uploadFileRequest("/information/uploadimg", formdata).then(resp=> {
          var json = resp.data;
          if (json.status == 'success') {
//            _this.$refs.md.$imgUpdateByUrl(pos, json.msg)
            _this.$refs.md.$imglst2Url([[pos, json.msg]])
          } else {
            _this.$message({type: json.status, message: json.msg});
          }
        });
      },
      imgDel(pos){

      },
      getCategories(){
        let _this = this;
        getRequest("/information/all?state=-1&page=1&count=100&keywords=").then(resp=> {
          _this.categories = resp.data.informations;
        });
      },
      handleClose(tag) {
        this.article.tagList.splice(this.article.tagList.findIndex(item=> item.id = tag.id), 1);
      },
      showInput() {
        this.tagInputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      handleInputConfirm() {
        let tagValue = this.tagValue;
        if (tagValue) {
          this.article.tagList.push({tagName: tagValue});
        }
        this.tagInputVisible = false;
        this.tagValue = '';
      }
    },
    data() {
      return {
        categories: [],
        tagInputVisible: false,
        tagValue: '',
        loading: false,
        from: '',
        article: {
          id: '-1',
          tagList: [],
          strTitle: '',
          mdContent: '',
          iid: ''
        },
        upload: false,
        percentage: 0,
        strategyFile: []
      }
    }
  }
</script>
<style>
  .post-article > .main > #editor {
    width: 100%;
    height: 450px;
    text-align: left;
  }

  .post-article > .header {
    background-color: #ececec;
    margin-top: 10px;
    padding-left: 5px;
    display: flex;
    justify-content: flex-start;
  }

  .post-article > .main {
    /*justify-content: flex-start;*/
    display: flex;
    flex-direction: column;
    padding-left: 5px;
    background-color: #ececec;
    padding-top: 0px;
  }

  .post-article > .header > .el-tag + .el-tag {
    margin-left: 10px;
  }

  .post-article > .header > .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .post-article > .header > .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }

  .post-article {
  }
  
</style>
