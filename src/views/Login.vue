<template>
  <div class="login-box">
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-position="left"
      label-width="0px"
      class="demo-ruleForm login-container"
    >
      <h3 class="title">系统登录</h3>
      <el-form-item prop="account">
        <el-input type="text" v-model="ruleForm.account" auto-complete="off" placeholder="账号"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password" v-model="ruleForm.password" auto-complete="off" placeholder="密码"></el-input>
      </el-form-item>
      <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
      <el-form-item style="width: 100%">
        <el-button type="primary" style="width: 100%" @click.native.prevent="handleSubmit" :loading="logining">
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { jwtDecode } from "jwt-decode";
export default {
  data() {
    return {
      logining: false,
      ruleForm: {
        account: "东邪",
        password: "123456",
      },
      rules: {
        account: [
          { required: true, message: "请输入账号", trigger: "blur" },
          //{ validator: validaePass }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          //{ validator: validaePass2 }
        ],
      },
      checked: true,
    };
  },
  methods: {
    //处理登录请求
    handleSubmit(ev) {
      this.$refs.ruleForm.validate((valid) => {
        if (!valid) return;
        this.logining = true;
        var loginParams = {
          account: this.ruleForm.account,
          password: this.ruleForm.password,
          type: 0,
        };
        this.$http
          .post("/login/account", loginParams)
          .then(({ data }) => {
            this.logining = false;
            if (data.success) {
              this.$message.success(data.message);
              let token = data.data;
              // 解析JWTtoken数据
              let jwtToken = jwtDecode(token);
              if (jwtToken) {
                localStorage.setItem("menus", JSON.stringify(jwtToken.payload.menus));
                localStorage.setItem("permissions", JSON.stringify(jwtToken.payload.permissions));
                localStorage.setItem("logininfo", JSON.stringify(jwtToken.payload.logininfo));
                localStorage.setItem("U-TOKEN", token);
                this.$router.push({ path: "/echarts" });
                // 刷新本地路由 
                location.reload();
              }
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((resp) => {});
      });
    },
  },
};
</script>

<style scoped>
.login-box {
  background-image: url("../assets/bg1.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.login-container {
  /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  /* background-clip: padding-box; */
  margin: 180px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  /* background: #fff; */
  background-image: url("../assets/bg1.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}
.login-container .title {
  margin: 0px auto 40px auto;
  text-align: center;
  color: #505458;
}
.login-container .remember {
  margin: 0px 0px 35px 0px;
}
</style>
