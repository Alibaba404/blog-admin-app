<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="keyword" placeholder="关键字"></el-input>
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
      <el-table-column prop="realName" label="真实姓名" width="120"></el-table-column>
      <el-table-column prop="userName" label="登录账号" width="120"></el-table-column>
      <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
      <el-table-column prop="remark" label="备注" width="300" show-overflow-tooltip></el-table-column>
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

    <!--添加或修改界面-->
    <el-dialog title="保存用户" :visible.sync="saveFormVisible" :close-on-click-modal="false">
      <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="saveForm.userName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="saveForm.realName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="saveForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱地址">
          <el-input v-model="saveForm.email" auto-complete="off"></el-input>
        </el-form-item>
        <!-- 编辑的时候展示密码,密码单独修改 -->
        <el-form-item label="登录密码" v-show="saveForm.id == null" prop="password">
          <el-input type="password" v-model="saveForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注信息">
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

      //3.删除相关数据

      //4.批量删除相关数据
      sels: [], //存储多选记录

      //5.添加和修改相关数据
      saveFormVisible: false,
      saveForm: {
        id: null,
        userName: "",
        realName: "",
        email: "",
        password: "", //后端需要通过md5加密
        remark: "",
        phone: "",
        //avatar头像 - 前端没有传递 - 需要文件上传
        //logininfo_id - 后端业务生成
      },

      //6.添加和修改校验规则-表单项校验
      saveFormRules: {
        userName: [{ required: true, message: "请输入用户名称", trigger: "blur" }],
        phone: [{ required: true, message: "请输入电话号码", trigger: "blur" }],
        password: [{ required: true, message: "请输入登录密码", trigger: "blur" }],
      },
    };
  },
  methods: {
    //1.分页查询相关方法
    //1.1.获取列表数据
    getTableData() {
      this.$http
        .post("/user", {
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
        this.$confirm(`确认删除${row.userName}信息吗?`, "提示", {
          type: "warning",
        })
          .then((resp) => {
            this.$http
              .delete(`/user/${row.id}`)
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
              .patch(`/user`, ids)
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
        id: null,
        userName: "",
        realName: "",
        email: "",
        password: "", //后端需要通过md5加密
        remark: "",
        phone: "",
      };
      this.saveFormVisible = true;
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
          .put("/user", this.saveForm)
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
