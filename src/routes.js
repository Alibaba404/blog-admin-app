import Login from "./views/Login.vue";
import NotFound from "./views/404.vue";
import Home from "./views/Home.vue";
import Echarts from "./views/charts/Echarts.vue";
let routes = [
  {
    path: "/login",
    component: Login,
    name: "",
    hidden: true,
  },
  {
    path: "/404",
    component: NotFound,
    name: "",
    hidden: true,
  },
  {
    path: "/",
    component: Home,
    name: "首页",
    leaf: true, //只有一个节点
    iconCls: "el-icon-s-home",
    children: [{ path: "/echarts", component: Echarts, name: "首页" }],
  },
  // {
  //   path: "/",
  //   component: Home,
  //   name: "系统管理",
  //   iconCls: "el-icon-monitor", //图标样式class
  //   children: [
  //     { path: "/log", component: User, name: "操作日志" },
  //     { path: "/role", component: Role, name: "角色管理" },
  //     { path: "/employee", component: Employee, name: "员工管理" },
  //     { path: "/menu", component: Menu, name: "菜单管理" },
  //     { path: "/permission", component: Permission, name: "权限管理" },
  //   ],
  // },
  // {
  //   path: "/",
  //   component: Home,
  //   name: "用户管理",
  //   iconCls: "el-icon-monitor", //图标样式class
  //   children: [{ path: "/user", component: User, name: "用户信息管理" }],
  // },
  // {
  //   path: "/",
  //   component: Home,
  //   name: "博客管理",
  //   iconCls: "el-icon-monitor", //图标样式class
  //   children: [
  //     { path: "/article", component: Article, name: "文章管理" },
  //     { path: "/articleType", component: ArticleType, name: "文章类型管理" },
  //     { path: "/params", component: Param, name: "参数管理" },
  //   ],
  // },
  {
    path: "*",
    hidden: true,
    redirect: { path: "/404" },
  },
];

export default routes;
