<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="keyword" placeholder="请输入名称..." clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" v-on:click="keywordQuery">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表v-loading="listLoading"-->
    <el-table
      :data="tableDatas"
      v-loading="listLoading"
      @selection-change="handleSelectionChange"
      :row-key="getRowKeys"
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
      <el-table-column type="index" width="70" label="序号"></el-table-column>
      <el-table-column label="文章封面" width="80" show-overflow-tooltip>
        <template scope="scope">
          <el-avatar shape="square" size="large" :src="scope.row.articlePic"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="articleName" label="文章名称" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="articleTag" label="文章标签" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="articleTypeName" label="文章类型" width="200" show-overflow-tooltip></el-table-column>
      <!-- 文章状态(0:草稿;1:发布;2:弃用) -->
      <el-table-column prop="articleState" label="文章状态" width="80" show-overflow-tooltip>
        <template scope="scope">
          <el-tag size="mini" v-if="scope.row.articleState == 0" type="info">草稿</el-tag>
          <el-tag size="mini" v-else-if="scope.row.articleState == 1" type="success">已发布</el-tag>
          <el-tag size="mini" v-else="scope.row.articleState" type="danger">已弃用</el-tag>
        </template>
      </el-table-column>
      <!-- 是否置顶(0:不置顶;1:置顶) -->
      <el-table-column prop="topState" label="是否置顶" width="80" show-overflow-tooltip>
        <template scope="scope">
          <el-tag size="mini" v-if="scope.row.topState == 0" type="info">不置顶</el-tag>
          <el-tag size="mini" v-else="scope.row.topState">置顶</el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="publishId" label="作者ID" width="120" show-overflow-tooltip></el-table-column> -->
      <el-table-column prop="publishUserName" label="作者" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="updateTime" label="修改时间" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="articleReadCount" label="文章阅读量" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="articleStarNum" label="文章点赞数" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="articleCommentNum" label="文章评论数" width="120" show-overflow-tooltip></el-table-column>
      <!-- <el-table-column prop="articleRemark" label="文章简介" width="120" show-overflow-tooltip></el-table-column> -->
      <!-- <el-table-column prop="articleContent" label="文章内容" show-overflow-tooltip></el-table-column> -->
      <el-table-column label="操作" fixed="right" width="180">
        <template scope="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--工具条-->
    <el-col :span="24" class="toolbar nobg">
      <el-button type="danger" size="medium" :disabled="this.sels.length === 0" @click="handlePatchDel">
        批量删除
      </el-button>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 15]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totals"
        style="float: right"
      ></el-pagination>
    </el-col>

    <!--添加或修改界面-->
    <el-dialog
      :title="formTitle"
      :visible.sync="saveFormVisible"
      :close-on-click-modal="false"
      @close="handlerCloseDialog"
    >
      <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
        <el-form-item label="文章名称" prop="articleName">
          <el-input v-model="saveForm.articleName" auto-complete="off"></el-input>
        </el-form-item>
        <!--文件上传-->
        <el-form-item label="文章封面">
          <el-upload
            ref="imgUpload"
            class="upload-demo"
            action="http://files.aikuiba.cn:30002/minio"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :on-exceed="exceed"
            :file-list="fileList"
            :limit="1"
            accept=".jpg,.jpeg,.png,.gif"
            list-type="picture"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传指定类型的图片</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="文章标签" prop="articleTag">
          <el-input v-model="saveForm.articleTag" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-radio-group v-model="saveForm.topState">
            <el-radio :label="1">置顶</el-radio>
            <el-radio :label="0">不置顶</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-radio-group v-model="saveForm.articleState">
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="1">发布</el-radio>
            <el-radio :label="2">弃用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="文章类型">
          <el-cascader
            style="width: 100%"
            v-model="saveForm.articleType"
            :options="allTypes"
            :props="{ expandTrigger: 'hover', value: 'id', label: 'typeName', checkStrictly: true }"
            filterable
            clearable
            @change="handleChangeType"
          ></el-cascader>
        </el-form-item>

        <el-form-item label="文章简介" prop="articleRemark">
          <el-input v-model="saveForm.articleRemark" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="文章内容" prop="articleContent">
          <!-- 富文本编辑器 -->
          <div class="edit_container">
            <quill-editor
              v-model="saveForm.articleContent"
              :options="editorOption"
              @ready="onEditorReady($event)"
            ></quill-editor>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="handlerCancel('saveForm')">取消</el-button>
        <el-button type="primary" @click.native="saveSubmit('saveForm')">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
//引入Vue的ueditor的资源
import { quillEditor } from "vue-quill-editor"; //调用编辑器
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
// 工具栏配置
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线 -----['bold', 'italic', 'underline', 'strike']
  ["blockquote", "code-block"], // 引用  代码块-----['blockquote', 'code-block']
  [{ header: 1 }, { header: 2 }], // 1、2 级标题-----[{ header: 1 }, { header: 2 }]
  [{ list: "ordered" }, { list: "bullet" }], // 有序、无序列表-----[{ list: 'ordered' }, { list: 'bullet' }]
  [{ script: "sub" }, { script: "super" }], // 上标/下标-----[{ script: 'sub' }, { script: 'super' }]
  [{ indent: "-1" }, { indent: "+1" }], // 缩进-----[{ indent: '-1' }, { indent: '+1' }]
  [{ direction: "rtl" }], // 文本方向-----[{'direction': 'rtl'}]
  [{ size: ["small", false, "large", "huge"] }], // 字体大小-----[{ size: ['small', false, 'large', 'huge'] }]
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题-----[{ header: [1, 2, 3, 4, 5, 6, false] }]
  [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色-----[{ color: [] }, { background: [] }]
  [{ font: [] }], // 字体种类-----[{ font: [] }]
  [{ align: [] }], // 对齐方式-----[{ align: [] }]
  ["clean"], // 清除文本格式-----['clean']
  ["image", "link"], // 链接、图片、视频-----['link', 'image', 'video']
];

//富文本框文件上传配置
const uploadConfig = {
  action: "http://files.aikuiba.cn:30002/minio", // 必填参数 图片上传地址
  methods: "POST", // 必填参数 图片上传方式
  token: "", // 可选参数 如果需要token验证，假设你的token有存放在sessionStorage
  name: "file", // 必填参数 文件的参数名
  size: 1024, // 可选参数   图片大小，单位为Kb, 1M = 1024Kb
  accept: "image/png, image/gif, image/jpeg, image/bmp, image/x-icon", // 可选 可上传的图片格式
  imgBaseUrl: "http://minio.java.itsource.cn/java0820/", // 图片前置url
};
import axios from "axios";
const handlers = {
  //重写图片上传
  image() {
    let self = this;
    let fileInput = this.container.querySelector("input.ql-image[type=file]");
    if (fileInput === null) {
      fileInput = document.createElement("input");
      fileInput.setAttribute("type", "file");
      // 设置图片参数名
      if (uploadConfig.name) {
        fileInput.setAttribute("name", uploadConfig.name);
      }
      // 可设置上传图片的格式
      fileInput.setAttribute("accept", uploadConfig.accept);
      fileInput.classList.add("ql-image");
      // 监听选择文件
      fileInput.addEventListener("change", function () {
        let params = new FormData();
        params.append("file", fileInput.files[0]);
        axios
          .post(uploadConfig.action, params, {
            headers: {
              "Content-Type": "multipart/form-data",
              token: uploadConfig.token,
            },
          })
          .then(({ data }) => {
            if (data.success) {
              let length = self.quill.getSelection(true).index;
              //写入图片
              self.quill.insertEmbed(length, "image", uploadConfig.imgBaseUrl + data.data);
              self.quill.setSelection(length + 1);
            } else {
              self.$message.error(res.data.message);
            }
            fileInput.value = "";
          });
      });
      this.container.appendChild(fileInput);
    }
    fileInput.click();
  },
};
export default {
  components: {
    quillEditor,
  },
  data() {
    return {
      //1.分页查询相关数据
      totals: 0, //总记录条数
      currentPage: 1, //当前页,要传递到后台的
      pageSize: 5, //每页显示多少条
      tableDatas: [], //当前页数据
      listLoading: false,
      //2.高级查询相关数据
      keyword: "",
      //4.批量删除相关数据
      sels: [], //存储多选记录
      //5.添加和修改相关数据
      saveFormVisible: false,
      formTitle: "新增文章",
      saveForm: {
        id: null,
        articleName: "",
        articleTag: "",
        articleType: null,
        topState: 0,
        articleState: 0,
        articleRemark: "",
        articleContent: "",
        articlePic: "",
      },
      allTypes: [],
      //6.添加和修改校验规则-表单项校验
      saveFormRules: {
        articleName: [{ required: true, message: "请输入文章名称", trigger: "blur" }],
      },
      // 富文本配置
      editorOption: {
        modules: {
          toolbar: { container: toolbarOptions, handlers: handlers }, //工具栏定义的
        },
        theme: "snow",
        placeholder: "请开始书写您的博客内容...",
      },
      fileList: [], //文件上传
      imgBaseUrl: "http://minio.java.itsource.cn/java0820/", // 图片前置url
    };
  },
  methods: {
    handleChangeType(arr) {
      if (arr) this.saveForm.articleType = arr[arr.length - 1];
    },
    //1.分页查询相关方法
    //1.1.获取列表数据
    getTableData() {
      this.$http
        .post("/article", {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          keywords: this.keyword,
        })
        .then((resp) => {
          if (resp.data.success) {
            this.tableDatas = resp.data.data.list;
            this.totals = resp.data.data.total;
          }
        })
        .catch((resp) => {});
    },
    //1.2.选择第几页时触发
    handleCurrentChange(curentPage) {
      this.currentPage = curentPage;
      this.getTableData();
    },
    //1.3.选择每页显示记录条数时触发
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getTableData();
    },
    //2.高级查询相关方法
    keywordQuery() {
      this.currentPage = 1;
      this.getTableData();
    },
    //3.删除相关方法
    handleDel(row) {
      if (row.id) {
        this.$confirm(`确认删除文章[${row.articleName}]吗?`, "提示", {
          type: "warning",
        })
          .then((resp) => {
            this.$http
              .delete(`/article/${row.id}`)
              .then((resp) => {
                if (resp.data.success) {
                  this.$message.success("删除成功!");
                  this.getTableData();
                  this.delMinioPicture(row.articlePic);
                  return;
                }
                this.$message.error("系统繁忙,请稍后再试!");
              })
              .catch(() => {
                this.$message.error("系统繁忙,请稍后再试!");
              });
          })
          .catch(() => {});
      }
    },
    //4.批量删除相关方法
    //4.1.选项改变时触发
    handleSelectionChange(val) {
      this.sels = val;
    },
    //4.2.批量删除
    handlePatchDel() {
      let ids = this.sels.map((o) => o.id);
      // console.log("=====>", ids);
      if (ids) {
        this.$confirm(`确认删除选中的数据`, "提示", {
          type: "warning",
        })
          .then((resp) => {
            this.$http
              .patch(`/article`, ids)
              .then((resp) => {
                if (resp.data.success) {
                  this.$message.success("删除成功!");
                  this.getTableData();
                  //批量删除Minio服务器图片
                  this.sels.forEach((row) => {
                    this.delMinioPicture(row.articlePic);
                  });
                  return;
                }
                this.$message.error("系统繁忙,请稍后再试!");
              })
              .catch(() => {
                this.$message.error("系统繁忙,请稍后再试!");
              });
          })
          .catch(() => {});
      }
    },
    handlerCancel(formName) {
      this.$refs[formName].resetFields();
      this.saveFormVisible = false;
    },
    //5.添加和修改相关方法
    //5.1.点击添加弹出对话框
    handleAdd() {
      this.saveForm = {
        id: null,
        articleName: "",
        articleTag: "",
        articleType: null,
        topState: 0,
        articleState: 0,
        articleRemark: "",
        articleContent: "",
        articlePic: "",
      };
      this.getAllTypes();
      this.saveFormVisible = true;
    },
    //5.2.点击修改弹出对话框
    handleEdit(row) {
      this.fileList.push({ url: row.articlePic });
      // 对象的浅拷贝,只将值拷贝到新的对象并将对象赋值给回显参数
      this.saveForm = Object.assign({}, row);
      this.getAllTypes();
      this.formTitle = "编辑文章";
      this.saveFormVisible = true;
    },
    //5.3.提交表单数据操作数据库
    saveSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          // this.$message.error("必填参数不能为空哦");
          return;
        }
        console.log(this.saveForm);
        // 发送新增或修改请求
        this.$http
          .put("/article", this.saveForm)
          .then(({ data }) => {
            this.saveFormVisible = false;
            this.listLoading = false;
            if (data.success) {
              this.$message.success(data.message);
              return this.getTableData();
            }
            if (data.info) {
              this.$message.error(`错误信息:${data.message},[${data.info}]`);
            } else {
              this.$message.error(`错误信息:${data.message}`);
            }
          })
          .catch((res) => {
            console.log(res);
            this.listLoading = false;
            this.$message.error("服务器繁忙,请稍后再试!");
          });
      });
    },
    // 获取文章树🌲
    getAllTypes() {
      // 获取全部文章
      this.$http
        .get("/articleType/allTypes")
        .then(({ data }) => {
          if (data.success) {
            this.allTypes = data.data;
          }
        })
        .catch((resp) => {});
    },
    // 关闭对话框的回调
    handlerCloseDialog() {
      // 清空校验提示
      this.$refs.saveForm.resetFields();
      // 清空已上传的文件列表
      this.$refs.imgUpload.clearFiles();
      // 清空回显列表
      this.fileList = [];
    },
    onEditorReady(editor) {
      //当富文本编辑框初始化好执行
      // console.log("富文本编辑框初始化---------完成");
    },
    // 移除图片回调
    handleRemove(file, files) {
      // url: "http://minio.java.itsource.cn/java0820/1700561661791.png"
      this.delMinioPicture(file.url, (data) => {
        if (data.success) {
          //清空fileList
          this.$refs.imgUpload.clearFiles();
          this.$message.success("删除成功!");
          // 删除图片后应该将当前数据中的articlePic也清空
          this.saveForm.articlePic = "";
          return;
        }
        this.$message.error("删除失败!");
      });
    },
    // 上传成功回调
    handleSuccess(response, file, files) {
      if (response.success) {
        let imgPath = this.imgBaseUrl + response.data;
        this.saveForm.articlePic = imgPath;
        this.fileList = [];
        this.fileList.push({ url: imgPath });
      } else {
        this.$message.error("文件上传失败!");
      }
    },
    // 超出文件个数限制回调
    exceed(file, files) {
      this.$message.info("超出文件上传个数[1]限制!");
    },
    /**
     * 删除Minio图片文件
     * @param {string} url 完整可访问的远程图片地址
     * @param {function} _callback 回调函数
     */
    delMinioPicture(url, _callback) {
      if (url) {
        let fileName = url.substring(url.lastIndexOf("/") + 1);
        if (fileName) {
          // 发送删除请求到8080服务器
          this.$http
            .delete(`/minio/${fileName}`)
            .then(({ data }) => {
              // 如果传了回调函数,这里就回去执行回调函数且将服务器返回的data传给回调函数
              if (_callback && typeof _callback == "function") _callback(data);
            })
            .catch((resp) => {
              this.$message.error("服务器异常!");
            });
        }
      }
    },
    getRowKeys(row) {
      return row.id;
    },
  },
  mounted() {
    this.getTableData();
  },
};
</script>

<style scoped>
.nobg {
  background-color: #fff;
}
</style>
