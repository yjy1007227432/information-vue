<template>
  <el-container v-loading="loading" class="post-article">
    <el-header class="header">
      <el-select v-model="article.cid" placeholder="请选择竞争信息栏目" style="width: 150px;">
        <el-option
          v-for="(item, index) in categories"
          :key="index"
          :label="item.cateName"
          :value="item.id">
        </el-option>
      </el-select>
      <el-input v-model="article.title" placeholder="请输入标题..." style="width: 200px;margin-left: 10px"></el-input>
      <el-input v-model="article.company" placeholder="公司" style="width: 200px;margin-left: 10px"></el-input>
      <el-input v-model="article.product" placeholder="产品" style="width: 200px;margin-left: 10px"></el-input>
      <el-input v-model="article.source" placeholder="来源" style="width: 200px;margin-left: 10px"></el-input>
      <el-input v-model="article.alarm" placeholder="重要性" style="width: 200px;margin-left: 10px"></el-input>
      <el-tag
        :key="index"
        v-for="(tag,index) in article.tagList"
        closable
        :disable-transitions="false"
        @close="handleClose(tag)" style="margin-left: 10px">
        {{tag.tagName}}
      </el-tag>
      <el-input
        class="input-new-tag"
        v-if="tagInputVisible"
        v-model="tagValue"
        ref="saveTagInput"
        size="small"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm">
      </el-input>
      <el-button v-else class="button-new-tag" type="primary" size="small" @click="showInput">+Tag</el-button>
    </el-header>
    <el-main class="main">
      
      <ul>
        <li v-for="(item,index) in informationFile" :key="index" class="link">{{item.src.split('/').slice(-1)[0]}}</li>
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
        getRequest("/information/" + id).then(resp=> {
          console.log(resp)
          _this.loading = false;
          if (resp.status == 200) {
            _this.article = resp.data;
            let informationFile = resp.data.informationFile
            if (informationFile) {
              informationFile = informationFile.split(',')
              informationFile.forEach((item,index) => {
                _this.informationFile.push({id: index, src: item})
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
        if (!(isNotNullORBlank(this.article.title, this.article.mdContent, this.article.cid))) {
          this.$message({type: 'error', message: '数据不能为空!'});
          return;
        }
        var _this = this;
        _this.loading = true;
        let tagList = []
        _this.article.tagList.forEach(item => {
          tagList.push(item.tagName)
        })
        let informationFile = []
        _this.informationFile.forEach(item => {
          informationFile.push(item.src)
        })
        postRequest("/information/", {
          id: _this.article.id,
          title: _this.article.title,
          mdContent: _this.article.mdContent,
          htmlContent: _this.$refs.md.d_render,
          cid: _this.article.cid,
          state: state,
          tagList: tagList,
          source: _this.article.source,
          product: _this.article.product,
          alarm: _this.article.alarm,
          company: _this.article.company,
          informationFile: informationFile.join(',')
        }).then(resp=> {
          _this.loading = false;
          if (resp.status == 200 && resp.data.status == 'success') {
            _this.article.id = resp.data.msg;
            _this.$message({type: 'success', message: state == 0 ? '保存成功!' : '发布成功!'});
//            if (_this.from != undefined) {
            window.bus.$emit('blogTableReload')
//            }
            if (state == 1) {
              _this.$router.replace({path: '/infolist'});
            }
          }
        }, resp=> {
          _this.loading = false;
          _this.$message({type: 'error', message: state == 0 ? '保存草稿失败!' : '信息发布失败!'});
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
        getRequest("/admin/category/all").then(resp=> {
          _this.categories = resp.data;
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
          title: '',
          mdContent: '',
          cid: '',
        },
        upload: false,
        percentage: 0,
        informationFile: []
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
  .link{
    list-style: decimal-leading-zero;
    text-align: left;
  }
</style>
