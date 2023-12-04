import Vue from "vue";
import App from "./App";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import VueRouter from "vue-router";
import store from "./store/index";
import Vuex from "vuex";
import routes from "./routes";
import "font-awesome/css/font-awesome.min.css";
import axios from "axios";

import * as echarts from "echarts";
import "@/common/js/permission";

Vue.prototype.$echarts = echarts;
//配置axios的全局基本路径
// axios.defaults.baseURL = "http://files.aikuiba.cn:30002";
axios.defaults.baseURL = "http://127.0.0.1:8080";
//全局属性配置，在任意组件内可以使用this.$http获取axios对象
Vue.prototype.$http = axios;

Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.use(Vuex);

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

const router = new VueRouter({
  routes,
});

// axios 前置拦截器(拦截所有axios请求)
axios.interceptors.request.use(
  (config) => {
    if (localStorage.getItem("U-TOKEN")) {
      // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
      config.headers["token"] = localStorage.getItem("U-TOKEN");
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

//axios的响应拦截器
axios.interceptors.response.use(
  (res) => {
    if (!res.data.success && res.data.code != 200) {
      //未登录
      ElementUI.Message({
        type: "error",
        message: res.data.message,
      });
      localStorage.removeItem("logininfo");
      localStorage.removeItem("menus");
      localStorage.removeItem("permissions");
      localStorage.removeItem("U-TOKEN");
      router.push({ path: "/login" }); // 这里是请求转发,路由拦截器不会再次拦截
    }
    return res;
  },
  (err) => {
    // 在请求错误时要做的事儿
    // 该返回的数据则是axios.catch(err)中接收的数据
    return Promise.reject(err);
  }
);

//每次路由之前都要执行,每次请求都要经过路由
//每次请求都不拦截到
router.beforeEach((to, from, next) => {
  if (to.path == "/login") {
    next(); //放行
  } else {
    let token = localStorage.getItem("U-TOKEN");
    if (token) {
      next();
    } else {
      next({ path: "/login" });
    }
  }
});

//处理页面刷新动态路由失效问题
initIndexRouters();
function initIndexRouters() {
  if (!localStorage.menus) {
    return;
  }
  //防止重复配置路由：4就是main.js中路由的个数 - 如果你的静态路由是6个这里要写成6
  if (router.options.routes.length > 4) {
    return;
  }
  let menus = localStorage.getItem("menus");
  menus = JSON.parse(menus);
  let tempRouters = [];
  menus.forEach((menu) => {
    let indexRouter = {
      path: "/",
      iconCls: menu.icon,
      name: menu.name,
      component: (resolve) => require(["@/views/Home"], resolve),
      children: [],
    };
    menu.children.forEach((cMenu) => {
      let cr = {
        path: cMenu.url,
        name: cMenu.name,
        component: (resolve) => require(["@/views/" + cMenu.component], resolve),
      };
      indexRouter.children.push(cr);
    });
    tempRouters.push(indexRouter);
    router.options.routes.push(indexRouter);
  });
  //动态路由配置
  router.addRoutes(tempRouters);
}

new Vue({
  router,
  store,
  render: (h) => h(App), // index.html id为app的div标签下面使用<App/>和template: '<App/>',一样的效果
}).$mount("#app"); // 和el: '#app'效果一样都是挂载在index.html id为app的div标签上面
