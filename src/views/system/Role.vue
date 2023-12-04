<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="keyword" placeholder="请输入角色名称..."></el-input>
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
      <el-table-column prop="name" label="角色名称" width="120"></el-table-column>
      <el-table-column prop="sn" label="角色编码" width="120"></el-table-column>
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

    <!--添加或修改界面:角色无新增,由后台自动生成-->
    <el-dialog title="保存角色" :visible.sync="saveFormVisible" :close-on-click-modal="false">
      <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="saveForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="sn">
          <el-input v-model="saveForm.sn" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色菜单">
          <!-- 
            collapse-tags:折叠tag(只显示一个)
            filterable:可输入搜索(前端)
           -->
          <el-cascader
            style="width: 100%"
            v-model="temp.menus"
            :options="allMenu"
            :props="{
              multiple: true, //是否开启多选
              checkStrictly: false, //是否只能选择子级
              expandTrigger: 'hover', //子级显示出发方式为hover
              value: 'id',
              label: 'name',
            }"
            filterable
            clearable
            @change="handleChangeMenu"
          ></el-cascader>
        </el-form-item>

        <el-form-item label="角色权限">
          <el-select style="width: 100%" v-model="temp.permissions" multiple @change="handleChangePermission">
            <el-option v-for="p in allPermissio" :key="p.id" :label="p.name" :value="p.id"></el-option>
          </el-select>
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
import { number } from "echarts";

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
        name: "",
        sn: "",
        // 已选中的菜单
        menus: [],
        permissions: [],
      },
      //6.添加和修改校验规则-表单项校验
      saveFormRules: {
        name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
      },
      // 全部菜单
      allMenu: [],
      // 全部权限
      allPermissio: [],
      // 临时对象
      temp: {
        menus: [],
        permissions: [],
      },
    };
  },
  methods: {
    /**
     * 选择菜单
     * @param {array} menus 已选中的菜单列表
     */
    handleChangeMenu(menus) {
      this.saveForm.menus = [];
      let _menus = [];
      menus.forEach((m) => {
        if (m.length > 1) {
          _menus.push({ id: m[m.length - 1], parentId: m[0] });
        } else if (m.length == 1) {
          _menus.push({ id: m[0] });
        }
      });
      this.saveForm.menus = _menus;
    },
    /**
     * 权限选择
     * @param {array} ids
     */
    handleChangePermission(ids) {
      this.saveForm.permissions = [];
      ids.forEach((id) => {
        this.saveForm.permissions.push({ id });
      });
    },
    /**
     * 获取列表数据
     */
    getTableData() {
      this.$http
        .post("/role", {
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
        this.$confirm(`确认删除角色${row.username}吗?`, "提示", {
          type: "warning",
        })
          .then((resp) => {
            this.$http
              .delete(`/role/${row.id}`)
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
              .patch(`/role`, ids)
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
      this.temp.permissions = [];
      this.temp.menus = [];
      this.saveFormVisible = false;
      this.$refs[formName].resetFields();
    },
    //5.添加和修改相关方法
    //5.1.点击添加弹出对话框
    handleAdd() {
      this.saveForm = {
        name: "",
        sn: "",
        menus: [],
        permissions: [],
      };
      this.saveFormVisible = true;
      this.temp.permissions = [];
      this.temp.menus = [];
    },
    //5.2.点击修改弹出对话框
    handleEdit(row) {
      // 对象的浅拷贝,只将值拷贝到新的对象并将对象赋值给回显参数
      this.saveForm = Object.assign({}, row);
      this.temp.permissions = row.permissions.map((p) => p.id);
      //创建一个新数组，用于装处理的数据
      let menuIds = [];
      //遍历menus[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, …],将里面每个id转成[一级路径Id,二级路径Id...]格式
      row.menus.forEach((m) => {
        //然后装到新数组中，遍历完成之后，每个数据都经过转换了的，然后在赋值给this.saveForm.menus左回显
        menuIds.push(this.menuEcho(this.allMenu, m.id));
      });
      this.temp.menus = menuIds;
      this.saveFormVisible = true;
    },
    //5.3.提交表单数据操作数据库
    saveSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        // 发送新增或修改请求
        this.$http
          .put("/role", this.saveForm)
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
     * 如果id不为空则表示编辑回显id
     * @param {number} id 文章类型id
     */
    getAllMenu() {
      // 获取全部文章类型
      this.$http
        .get(`/menu/allMenu`)
        .then(({ data }) => {
          if (data.success) {
            this.allMenu = data.data;
          }
        })
        .catch((resp) => {});
    },
    /**
     * 获取全部权限
     */
    getAllPermissio() {
      this.$http
        .get("/permission")
        .then(({ data }) => {
          if (data.success) {
            this.allPermissio = data.data;
          }
        })
        .catch((resp) => {});
    },
    // el-cascader递归获取父级id
    menuEcho(list, id) {
      // list：是级联选择器的options集合
      // id：你要查找的级联关系的最后一级的id
      let arr = []; // 在递归时操作的数组
      let returnArr = []; // 存放结果的数组
      let depth = 0; // 定义全局层级
      // 定义递归函数
      function childrenEach(childrenData, depthN) {
        for (var j = 0; j < childrenData.length; j++) {
          depth = depthN; // 将执行的层级赋值 到 全局层级
          arr[depthN] = childrenData[j].id;
          if (childrenData[j].id == id) {
            returnArr = arr.slice(0, depthN + 1); //将目前匹配的数组，截断并保存到结果数组，
            break;
          } else {
            if (childrenData[j].children) {
              depth++;
              childrenEach(childrenData[j].children, depth);
            }
          }
        }
        return returnArr;
      }
      return childrenEach(list, depth);
    },
  },
  mounted() {
    // 页面加载完成就去获取数据
    this.getTableData();
    // 获取全部权限
    this.getAllPermissio();
    // 获取全部菜单
    this.getAllMenu();
  },
};
</script>

<style scoped>
.nobg {
  background-color: #fff;
}
</style>
