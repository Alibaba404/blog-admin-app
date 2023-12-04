<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="keyword" placeholder="请输入类型名称..."></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" v-on:click="keywordQuery">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-upload
            class="upload-demo"
            action="http://files.aikuiba.cn:30002/course/importCourse"
            :headers="headerObj"
            :on-success="importCourseSuccess"
            :show-file-list="false"
            :on-progress="progressImportCourse"
            v-loading="loadingImportCourse"
          >
            <el-button type="primary">课程导入</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleExportCourse">课程导出</el-button>
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
      <el-table-column prop="lectureTime" label="上课时间" width="100"></el-table-column>
      <el-table-column prop="week" label="星期" width="100"></el-table-column>
      <el-table-column prop="teacher" label="课程讲师" width="100"></el-table-column>
      <el-table-column prop="content" label="课程内容"></el-table-column>
      <el-table-column prop="remark" label="课程备注"></el-table-column>
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

    <!--
        添加或修改界面
    -->
    <el-dialog title="保存课程" :visible.sync="saveFormVisible" :close-on-click-modal="false">
      <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
        <el-form-item label="课程日期">
          <el-date-picker
            style="width: 100%"
            v-model="saveForm.lectureTime"
            :editable="false"
            :clearable="false"
            type="date"
            placeholder="选择日期"
            @change="changeLectureTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="课程星期">
          <el-input disabled v-model="saveForm.week" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="课程内容" prop="content">
          <el-input v-model="saveForm.content" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="课程讲师">
          <el-input v-model="saveForm.teacher" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="课程备注">
          <el-input v-model="saveForm.remark" auto-complete="off"></el-input>
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
        lectureTime: new Date(),
        week: "",
        content: "",
        teacher: "",
        remark: "",
      },
      //6.添加和修改校验规则-表单项校验
      saveFormRules: {
        content: [{ required: true, message: "请输入课程内容", trigger: "blur" }],
      },
      headerObj: {
        FROMAPP: "APP",
      },
      // 文件上传等待
      loadingImportCourse: false,
    };
  },
  methods: {
    handleChangeCourse(arr) {
      if (arr) this.saveForm.parentId = arr[arr.length - 1];
    },
    //1.分页查询相关方法
    //1.1.获取列表数据
    getTableData() {
      this.$http
        .post("/course", {
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
        this.$confirm(`确认删除课程${row.content}吗?`, "提示", {
          type: "warning",
        })
          .then((resp) => {
            this.$http
              .delete(`/course/${row.id}`)
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
              .patch(`/course`, ids)
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
    handlerCancel(formName) {
      this.saveFormVisible = false;
      this.$refs[formName].resetFields();
    },
    //5.添加和修改相关方法
    //5.1.点击添加弹出对话框
    handleAdd() {
      this.saveForm = {
        lectureTime: new Date(),
        week: "",
        content: "",
        teacher: "",
        remark: "",
      };
      this.saveFormVisible = true;
      this.changeLectureTime(new Date());
    },
    //5.2.点击修改弹出对话框
    handleEdit(row) {
      this.saveFormVisible = true;
      // 对象的浅拷贝,只将值拷贝到新的对象并将对象赋值给回显参数
      this.saveForm = Object.assign({}, row);
    },
    //5.3.提交表单数据操作数据库
    saveSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          // this.$message.error("必填参数不能为空哦");
          return;
        }
        // 发送新增或修改请求
        this.$http
          .put("/course", this.saveForm)
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
    // 选择课程日期
    changeLectureTime(time) {
      let xq = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
      if (time) {
        this.saveForm.week = xq[new Date(time).getDay()];
      }
    },
    importCourseSuccess(response, file, fileList) {
      if (response.success) {
        this.$message.success("课程导入成功!");
      }
      this.getTableData();
      this.loadingImportCourse = false;
    },
    progressImportCourse(event, file, fileList) {
      this.loadingImportCourse = true;
    },
    handleExportCourse() {
      let ids = this.sels.map((c) => c.id);
      if (ids) {
        location.href = `http://files.aikuiba.cn:30002/course/exportCourse?FROMAPP=APP&ids=${ids}`;
      }
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
