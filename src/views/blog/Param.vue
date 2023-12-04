<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="keyword" placeholder="请输入参数名称..."></el-input>
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
      highlight-current-row
      style="width: 100%"
    >
      <!--多选框-->
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="index" width="70" label="序号"></el-table-column>
      <el-table-column prop="operatorName" label="操作人" width="120"></el-table-column>
      <el-table-column prop="paramDesc" label="参数描述" width="180"></el-table-column>
      <el-table-column prop="paramKey" label="参数键" width="120"></el-table-column>
      <el-table-column prop="paramValue" label="参数值" width="320" show-overflow-tooltip></el-table-column>
      <!-- 参数类型(0:普通表单项,1:文件上传表单项) -->
      <el-table-column prop="type" label="参数类型" width="130">
        <template scope="scope">
          <el-tag v-if="scope.row.type == 0">普通表单项</el-tag>
          <el-tag type="success" v-if="scope.row.type == 1">文件上传表单项</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="添加时间" width="180"></el-table-column>
      <el-table-column prop="updateTime" label="修改时间" width="180"></el-table-column>
      <!-- show-overflow-tooltip -->
      <el-table-column label="操作">
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

    <!--添加或修改界面:参数无新增,由后台自动生成-->
    <el-dialog title="保存参数" :visible.sync="saveFormVisible" :close-on-click-modal="false">
      <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
        <el-form-item label="参数类型">
          <el-radio-group v-model="saveForm.type" @input="handleChooseParamType">
            <el-radio :label="0">普通表单项</el-radio>
            <el-radio :label="1">文件上传表单项</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="参数键" prop="paramKey">
          <el-input v-model="saveForm.paramKey" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="参数值" prop="paramValue">
          <el-upload
            v-if="saveForm.type == 1"
            v-model="saveForm.paramValue"
            class="avatar-uploader"
            action="http://files.aikuiba.cn:30002/minio"
            :show-file-list="false"
            :limit="1"
            :on-success="handleUploadSuccess"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>

          <el-input v-if="saveForm.type == 0" v-model="saveForm.paramValue" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="参数描述" prop="paramDesc">
          <el-input v-model="saveForm.paramDesc" auto-complete="off"></el-input>
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
export default {
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
      saveForm: {
        paramKey: "",
        paramValue: "",
        type: 0,
        paramDesc: "",
      },
      //6.添加和修改校验规则-表单项校验
      saveFormRules: {
        name: [{ required: true, message: "请输入参数名称", trigger: "blur" }],
      },
      // 图片前置url
      imgBaseUrl: "http://minio.java.itsource.cn/java0820/",
      // 图片上传地址
      imageUrl: "",
    };
  },
  methods: {
    /**
     * 获取列表数据
     */
    getTableData() {
      this.$http
        .post("/param", {
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
        this.$confirm(`确认删除参数${row.paramKey}吗?`, "提示", {
          type: "warning",
        })
          .then((resp) => {
            let imageName = row.paramValue.substring(row.paramValue.lastIndexOf("/") + 1);
            this.$http
              .delete(`/param/${row.id}`)
              .then((resp) => {
                if (resp.data.success) {
                  this.$message.success("删除成功!");
                  this.getTableData();
                  this.$http.delete(`/minio/${imageName}`);
                } else {
                  this.$message.error("系统繁忙,请稍后再试!");
                }
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
      if (ids) {
        this.$confirm(`确认删除选中的数据`, "提示", {
          type: "warning",
        })
          .then((resp) => {
            this.$http
              .patch(`/param`, ids)
              .then((resp) => {
                if (resp.data.success) {
                  this.$message.success("删除成功!");
                  this.getTableData();
                } else {
                  this.$message.error("系统繁忙,请稍后再试!");
                }
              })
              .catch(() => {
                this.$message.error("系统繁忙,请稍后再试!");
              });
          })
          .catch(() => {});
      }
    },
    /**
     * 取消新增/编辑框
     * @param {string} formName 表单ref
     */
    handlerCancel(formName) {
      this.saveFormVisible = false;
      this.$refs[formName].resetFields();
      this.imageUrl = "";
    },
    //5.添加和修改相关方法
    //5.1.点击添加弹出对话框
    handleAdd() {
      this.saveForm = {
        paramKey: "",
        paramValue: "",
        type: 0,
        paramDesc: "",
      };
      this.saveFormVisible = true;
    },
    //5.2.点击修改弹出对话框
    handleEdit(row) {
      // 对象的浅拷贝,只将值拷贝到新的对象并将对象赋值给回显参数
      this.saveForm = Object.assign({}, row);
      this.saveFormVisible = true;
      this.imageUrl = "";
      if (row.type == 1) this.imageUrl = row.paramValue;
    },
    //5.3.提交表单数据操作数据库
    saveSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        // 发送新增或修改请求
        this.$http
          .put("/param", this.saveForm)
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
            this.listLoading = false;
            this.$message.error("服务器繁忙,请稍后再试!");
          });
      });
    },
    /**
     * 选择参数类型
     * @param {string} label 单选框值
     */
    handleChooseParamType(label) {
      // if (0 == label) this.imageUrl = "";
    },
    // 图片上传成功
    handleUploadSuccess(response, file, files) {
      if (response.success) {
        let imgName = response.data;
        let imgPath = this.imgBaseUrl + imgName;
        this.saveForm.paramValue = imgPath;
        this.imageUrl = imgPath;
      } else {
        this.$message.error("文件上传失败!");
      }
    },
  },
  mounted() {
    // 页面加载完成就去获取数据
    this.getTableData();
  },
};
</script>

<style>
.nobg {
  background-color: #fff;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
