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
          <el-button type="primary" v-permission="'employee:save'" @click="handleAdd">新增</el-button>
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
      <el-table-column prop="username" label="账号" width="120"></el-table-column>
      <el-table-column prop="phone" label="电话" width="120"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="120"></el-table-column>
      <el-table-column prop="age" label="年龄" width="120"></el-table-column>
      <el-table-column prop="state" label="员工状态" width="120">
        <template scope="scope">
          <el-tag size="mini" v-if="scope.row.state == 0" type="info">禁用</el-tag>
          <el-tag size="mini" v-else-if="scope.row.state == 1" type="success">启用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="员工角色">
        <template scope="scope">
          <el-tag type="info" size="mini" style="margin: 0 3px" v-for="role in scope.row.roles">{{ role.name }}</el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="departmentId" label="所属部门" width="120"></el-table-column> -->
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
    <el-dialog title="保存员工" :visible.sync="saveFormVisible" @close="closeDialog" :close-on-click-modal="false">
      <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
        <el-form-item label="账号" prop="username">
          <el-input v-model="saveForm.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" v-if="saveForm.id == null">
          <el-input v-model="saveForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            style="width: 100%"
            v-model="temp.roles"
            multiple
            placeholder="请选择员工角色..."
            @change="handleChangeRole"
          >
            <el-option v-for="role in allRole" :key="role.id" :label="role.name" :value="role.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number
            v-model.number="saveForm.age"
            :min="18"
            :max="99"
            @change="handleChangeEmployeeAge"
            label="请输入员工年龄..."
          ></el-input-number>
        </el-form-item>
        <el-form-item label="员工状态">
          <el-radio-group v-model="saveForm.state">
            <el-radio :label="1">可用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="电话号码" prop="phone">
          <el-input v-model="saveForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="saveForm.email" auto-complete="off"></el-input>
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
        username: "",
        phone: "",
        email: "",
        password: "",
        age: 18,
        state: 0,
        // 员工角色
        roles: [],
      },
      //6.添加和修改校验规则-表单项校验
      saveFormRules: {
        username: [{ required: true, message: "请输入员工账号", trigger: "blur" }],
        phone: [{ required: true, message: "请输入员工电话号码", trigger: "blur" }],
      },
      // 全部可用角色
      allRole: [],
      // 临时对象
      temp: {
        roles: [],
      },
    };
  },
  methods: {
    //1.分页查询相关方法
    //1.1.获取列表数据
    getTableData() {
      this.$http
        .post("/employee", {
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
        this.$confirm(`确认删除员工${row.username}吗?`, "提示", {
          type: "warning",
        })
          .then((resp) => {
            this.$http
              .delete(`/employee/${row.id}`)
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
              .patch(`/employee`, ids)
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
    // 对话框取消
    handlerCancel(formName) {
      this.saveFormVisible = false;
      this.$refs[formName].resetFields();
    },
    //5.添加和修改相关方法
    //5.1.点击添加弹出对话框
    handleAdd() {
      this.saveForm = {
        username: "",
        phone: "",
        email: "",
        password: "",
        age: 18,
        state: 0,
        // 员工角色
        roles: [],
      };
      // 清空临时对象里面的角色列表
      this.temp.roles = [];
      this.saveFormVisible = true;
    },
    //5.2.点击修改弹出对话框
    handleEdit(row) {
      // 对象的浅拷贝,只将值拷贝到新的对象并将对象赋值给回显参数
      this.saveForm = Object.assign({}, row);
      this.temp.roles = row.roles.map((r) => r.id);
      //显示对话框
      this.saveFormVisible = true;
    },
    //5.3.提交表单数据操作数据库
    saveSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        // 发送新增或修改请求
        this.$http
          .put("/employee", this.saveForm)
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
    handleChangeEmployeeAge(age) {
      console.log(`修改后的员工年龄:${age}`);
    },
    /**
     *  改变角色选择
     * @param {array} roles 已选中的全部角色
     */
    handleChangeRole(ids) {
      this.saveForm.roles = [];
      ids.forEach((id) => {
        this.saveForm.roles.push({ id: id });
      });
    },
    /**
     * 获取全部角色
     */
    getAllRole() {
      this.$http
        .get("/role")
        .then(({ data }) => {
          if (data.success) {
            this.allRole = data.data;
          }
        })
        .catch((resp) => {});
    },
    /**
     * 对话框关闭事件
     */
    closeDialog() {
      this.temp.roles = [];
      this.saveForm.roles = [];
    },
  },
  mounted() {
    this.getTableData();
    // 获取全部角色信息
    this.getAllRole();
  },
};
</script>

<style scoped>
.nobg {
  background-color: #fff;
}
</style>
