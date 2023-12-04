<template>
  <section class="chart-container">
    <el-row>
      <el-col :span="12">
        <div id="chartColumn" style="width: 100%; height: 400px"></div>
      </el-col>
      <el-col :span="12">
        <div id="chartPie" style="width: 100%; height: 400px"></div>
      </el-col>
      <el-col :span="12">
        <div id="chartBar" style="width: 100%; height: 400px"></div>
      </el-col>
      <el-col :span="12">
        <div id="chartLine" style="width: 100%; height: 400px"></div>
      </el-col>
    </el-row>
  </section>
</template>

<script>
export default {
  data() {
    return {
      // 柱状图数据
      chartColumn: null,
      // 饼状图
      chartPie: null,
      chartBar: null,
      chartLine: null,
    };
  },
  methods: {
    drawColumnChart() {
      this.chartColumn = this.$echarts.init(document.getElementById("chartColumn"));
      this.$http
        .get("/article/topStarNum")
        .then(({ data }) => {
          if (data.success) {
            this.chartColumn.setOption({
              title: { text: "点赞前6的文章" },
              tooltip: {},
              // x轴数据
              xAxis: {
                data: data.data.names,
              },
              // y轴数据
              yAxis: {},
              // 真实数据
              series: [
                {
                  name: "点赞量",
                  type: "bar",
                  data: data.data.stars,
                },
              ],
              axisLabel: {
                interval: 0,
                formatter: function (value) {
                  let len = value.length;
                  let length = 6; //控制一行显示个数
                  let num = Math.ceil(len / length); //循环次数
                  if (num > 1) {
                    let str = "";
                    for (let i = 0; i < num; i++) {
                      str += value.substring(i * length, (i + 1) * length) + "\n";
                    }
                    return str;
                  } else {
                    return value;
                  }
                },
              },
            });
          }
        })
        .then((res) => {});
    },
    drawBarChart() {
      this.chartBar = this.$echarts.init(document.getElementById("chartBar"));
      this.chartBar.setOption({
        title: {
          text: "Bar Chart",
          subtext: "数据来自网络",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {
          data: ["2011年", "2012年"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          boundaryGap: [0, 0.01],
        },
        yAxis: {
          type: "category",
          data: ["巴西", "印尼", "美国", "印度", "中国", "世界人口(万)"],
        },
        series: [
          {
            name: "2011年",
            type: "bar",
            data: [18203, 23489, 29034, 104970, 131744, 630230],
          },
          {
            name: "2012年",
            type: "bar",
            data: [19325, 23438, 31000, 121594, 134141, 681807],
          },
        ],
      });
    },
    drawLineChart() {
      this.chartLine = this.$echarts.init(document.getElementById("chartLine"));
      this.chartLine.setOption({
        title: {
          text: "Line Chart",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["邮件营销", "联盟广告", "搜索引擎"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "邮件营销",
            type: "line",
            stack: "总量",
            data: [120, 132, 101, 134, 90, 230, 210],
          },
          {
            name: "联盟广告",
            type: "line",
            stack: "总量",
            data: [220, 182, 191, 234, 290, 330, 310],
          },
          {
            name: "搜索引擎",
            type: "line",
            stack: "总量",
            data: [820, 932, 901, 934, 1290, 1330, 1320],
          },
        ],
      });
    },
    drawPieChart() {
      this.chartPie = this.$echarts.init(document.getElementById("chartPie"));
      this.$http
        .get("/article/topCountArticleType")
        .then(({ data }) => {
          if (data.success) {
            let names = data.data.map((t) => t.articleTypeName);
            let datas = [];
            data.data.forEach((t) => {
              datas.push({ name: t.articleTypeName, value: t.articleCount });
            });
            this.chartPie.setOption({
              title: {
                text: "文章数量前5的文章类型",
                subtext: "2023-12-03",
                x: "center",
              },
              tooltip: {
                trigger: "item",
                formatter: "{a} <br/>{b} : {c} ({d}%)",
              },
              legend: {
                orient: "vertical",
                left: "left",
                data: names,
              },
              series: [
                {
                  name: "访问来源",
                  type: "pie",
                  radius: "55%",
                  center: ["50%", "60%"],
                  data: datas,
                  itemStyle: {
                    emphasis: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: "rgba(0, 0, 0, 0.5)",
                    },
                  },
                },
              ],
            });
          }
        })
        .catch((res) => {});
    },
    drawCharts() {
      this.drawColumnChart();
      this.drawBarChart();
      this.drawLineChart();
      this.drawPieChart();
    },
  },

  mounted() {
    this.drawCharts();
  },
  updated() {
    this.drawCharts();
  },
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  float: left;
}
/*.chart div {
        height: 400px;
        float: left;
    }*/

.el-col {
  padding: 30px 20px;
}
</style>
