<template>
  <el-row class="container">
    <el-col :span="24" class="header" :style="settings.backgroudColor">
      <el-col :span="10" class="logo" :class="collapsed ? 'logo-collapse-width' : 'logo-width'">
        {{ collapsed ? "" : sysName }}
      </el-col>
      <!--<el-col :span="10">
				<div class="tools" @click.prevent="collapse">
					<i class="fa fa-align-justify"></i>
				</div>
			</el-col>-->
      <el-col :span="4" class="userinfo">
        <el-dropdown trigger="hover">
          <span class="el-dropdown-link userinfo-inner">
            <img :src="settings.avatarUrl" />
            {{ sysUserName }}
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>我的消息</el-dropdown-item>
            <el-dropdown-item @click.native="dialogSetting">系统设置</el-dropdown-item>
            <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!-- 系统设置对话框 -->
        <el-dialog title="系统设置" style="text-align: left; margin: 0 auto" :visible.sync="dialogSettingVisible">
          <el-form :model="settings" label-width="80">
            <el-form-item label="头部背景">
              <el-color-picker v-model="temp.backgroudColor" autocomplete="off"></el-color-picker>
            </el-form-item>
            <el-form-item label="原密码">
              <el-input placeholder="请输入密码" v-model="settings.password.original" show-password></el-input>
            </el-form-item>
            <el-form-item label="新密码">
              <el-input placeholder="请输入密码" v-model="settings.password.newpass" show-password></el-input>
            </el-form-item>
            <el-form-item label="头像">
              <el-upload
                class="avatar-uploader"
                action="http://files.aikuiba.cn:30002/minio"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="settings.avatarUrl" :src="settings.avatarUrl" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogSettingVisible = false">取 消</el-button>
            <el-button type="primary" @click="confirmSetting">确 定</el-button>
          </div>
        </el-dialog>
      </el-col>
    </el-col>
    <el-col :span="24" class="main">
      <aside :class="collapsed ? 'menu-collapsed' : 'menu-expanded'">
        <!--导航菜单-->
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          @open="handleopen"
          @close="handleclose"
          @select="handleselect"
          unique-opened
          router
          v-show="!collapsed"
        >
          <template v-for="(item, index) in menus" v-if="!item.hidden">
            <el-submenu :index="index + ''" v-if="!item.leaf">
              <template slot="title">
                <i :class="item.iconCls"></i>
                {{ item.name }}
              </template>
              <el-menu-item v-for="child in item.children" :index="child.path" :key="child.path" v-if="!child.hidden">
                {{ child.name }}
              </el-menu-item>
            </el-submenu>
            <el-menu-item v-if="item.leaf && item.children.length > 0" :index="item.children[0].path">
              <i :class="item.iconCls"></i>
              {{ item.children[0].name }}
            </el-menu-item>
          </template>
        </el-menu>
        <!--导航菜单-折叠后-->
        <ul class="el-menu el-menu-vertical-demo collapsed" v-show="collapsed" ref="menuCollapsed">
          <li v-for="(item, index) in menus" v-if="!item.hidden" class="el-submenu item">
            <template v-if="!item.leaf">
              <div
                class="el-submenu__title"
                style="padding-left: 20px"
                @mouseover="showMenu(index, true)"
                @mouseout="showMenu(index, false)"
              >
                <i :class="item.iconCls"></i>
              </div>
              <ul
                class="el-menu submenu"
                :class="'submenu-hook-' + index"
                @mouseover="showMenu(index, true)"
                @mouseout="showMenu(index, false)"
              >
                <li
                  v-for="child in item.children"
                  v-if="!child.hidden"
                  :key="child.path"
                  class="el-menu-item"
                  style="padding-left: 40px"
                  :class="$route.path == child.path ? 'is-active' : ''"
                  @click="$router.push(child.path)"
                >
                  {{ child.name }}
                </li>
              </ul>
            </template>
            <template v-else>
              <li class="el-submenu">
                <div
                  class="el-submenu__title el-menu-item"
                  style="padding-left: 20px; height: 56px; line-height: 56px; padding: 0 20px"
                  :class="$route.path == item.children[0].path ? 'is-active' : ''"
                  @click="$router.push(item.children[0].path)"
                >
                  <i :class="item.iconCls"></i>
                </div>
              </li>
            </template>
          </li>
        </ul>
      </aside>
      <section class="content-container">
        <div class="grid-content bg-purple-light">
          <el-col :span="24" class="breadcrumb-container">
            <strong class="title">{{ $route.name }}</strong>
            <el-breadcrumb separator="/" class="breadcrumb-inner">
              <el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
                {{ item.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="24" class="content-wrapper">
            <transition name="fade" mode="out-in">
              <router-view></router-view>
            </transition>
          </el-col>
        </div>
      </section>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      sysName: "博客后台管理系统",
      collapsed: false,
      sysUserName: "Neuronet",
      form: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: "",
      },
      menus: [],
      dialogSettingVisible: false,
      settings: {
        backgroudColor: "background: #20a0ff",
        password: {
          newpass: "",
          original: "",
        },
        // 图片基础地址
        imageBaseUrl: "http://minio.java.itsource.cn/java0820/",
        avatarUrl: "",
      },
      temp: {
        backgroudColor: "#20a0ff",
      },
    };
  },
  methods: {
    onSubmit() {
      console.log("submit!");
    },
    handleopen() {
      //console.log('handleopen');
    },
    handleclose() {
      //console.log('handleclose');
    },
    handleselect: function (a, b) {},
    //退出登录
    logout: function () {
      var _this = this;
      this.$confirm("确认退出吗?", "提示", {
        type: "warning",
      })
        .then(() => {
          localStorage.removeItem("logininfo");
          localStorage.removeItem("menus");
          localStorage.removeItem("permissions");
          localStorage.removeItem("U-TOKEN");
          _this.$router.push("/login");
        })
        .catch(() => {});
    },
    //折叠导航栏
    collapse: function () {
      this.collapsed = !this.collapsed;
    },
    showMenu(i, status) {
      this.$refs.menuCollapsed.getElementsByClassName("submenu-hook-" + i)[0].style.display = status ? "block" : "none";
    },
    // 设置对话框
    dialogSetting() {
      this.dialogSettingVisible = true;
    },
    // 确认系统设置
    confirmSetting() {
      // 头部背景色
      this.settings.backgroudColor = `background:${this.temp.backgroudColor}`;
      // 将不重要信息缓存到本地存储
      localStorage.setItem(
        "settings",
        JSON.stringify({
          backgroudColor: this.settings.backgroudColor,
        })
      );

      //密码修改
      let original = this.settings.password.original;
      let newpass = this.settings.password.newpass;
      let isChangePassword = original && newpass;

      if (original && newpass && original == newpass) {
        this.$message.info("新密码和原密码一样哦!");
        return;
      }
      let uid = JSON.parse(localStorage.getItem("logininfo")).id;
      this.$http
        .post("/logininfo/updateLogininfo", {
          id: uid,
          original,
          newpass,
          avatarUrl: this.settings.avatarUrl,
        })
        .then(({ data }) => {
          if (data.success) {
            this.$message.success("设置更新成功!");
            if (isChangePassword) {
              // 重新登录
              localStorage.removeItem("logininfo");
              localStorage.removeItem("menus");
              localStorage.removeItem("permissions");
              localStorage.removeItem("U-TOKEN");
              this.$router.push("/login");
            }
            this.dialogSettingVisible = false;
          }
        });
    },
    beforeAvatarUpload(file) {},
    // 头像上传成功回调
    handleAvatarSuccess(response, file, fileList) {
      if (response.success) {
        // 删除旧图片
        let avatarName = this.settings.avatarUrl.substring(this.settings.avatarUrl.lastIndexOf("/") + 1);
        this.$http
          .delete(`/minio/${avatarName}`)
          .then(({ data }) => {})
          .catch((res) => {});
        this.settings.avatarUrl = this.settings.imageBaseUrl + response.data;
      }
    },
  },
  mounted() {
    let loginfo = JSON.parse(localStorage.getItem("logininfo"));
    let settings = JSON.parse(localStorage.getItem("settings"));
    this.sysUserName = "欢迎您:" + loginfo.username;
    this.settings.avatarUrl = loginfo.avatarUrl;
    if (settings && settings.backgroudColor) {
      this.settings.backgroudColor = settings.backgroudColor;
    }
    setTimeout(() => {
      this.sysUserName = loginfo.username;
    }, 3000);
    this.menus = this.$router.options.routes;
  },
};
</script>

<style scoped lang="scss">
.container {
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 100%;
  .header {
    height: 60px;
    line-height: 60px;
    color: #fff;
    .userinfo {
      text-align: right;
      padding-right: 35px;
      float: right;
      .userinfo-inner {
        cursor: pointer;
        color: #fff;
        img {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          margin: 10px 0px 10px 10px;
          float: right;
        }
      }
    }
    .logo {
      //width:230px;
      height: 60px;
      font-size: 22px;
      padding-left: 20px;
      padding-right: 20px;
      border-color: rgba(238, 241, 146, 0.3);
      border-right-width: 1px;
      border-right-style: solid;
      img {
        width: 40px;
        float: left;
        margin: 10px 10px 10px 18px;
      }
      .txt {
        color: #fff;
      }
    }
    .logo-width {
      width: 230px;
    }
    .logo-collapse-width {
      width: 60px;
    }
    .tools {
      padding: 0px 23px;
      width: 14px;
      height: 60px;
      line-height: 60px;
      cursor: pointer;
    }
  }
  .main {
    display: flex;
    // background: #324057;
    position: absolute;
    top: 60px;
    bottom: 0px;
    overflow: hidden;
    aside {
      flex: 0 0 230px;
      width: 230px;
      // position: absolute;
      // top: 0px;
      // bottom: 0px;
      .el-menu {
        height: 100%;
      }
      .collapsed {
        width: 60px;
        .item {
          position: relative;
        }
        .submenu {
          position: absolute;
          top: 0px;
          left: 60px;
          z-index: 99999;
          height: auto;
          display: none;
        }
      }
    }
    .menu-collapsed {
      flex: 0 0 60px;
      width: 60px;
    }
    .menu-expanded {
      flex: 0 0 230px;
      width: 230px;
    }
    .content-container {
      // background: #f1f2f7;
      flex: 1;
      // position: absolute;
      // right: 0px;
      // top: 0px;
      // bottom: 0px;
      // left: 230px;
      overflow-y: scroll;
      padding: 20px;
      .breadcrumb-container {
        //margin-bottom: 15px;
        .title {
          width: 200px;
          float: left;
          color: #475669;
        }
        .breadcrumb-inner {
          float: right;
        }
      }
      .content-wrapper {
        background-color: #fff;
        box-sizing: border-box;
      }
    }
  }
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
