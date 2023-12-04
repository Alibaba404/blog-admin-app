import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

// 定义所需的 mutations
const mutations = {
  INCREMENT(state) {
    state.count++;
  },
  DECREMENT(state) {
    state.count--;
  },
};

export default new Vuex.Store({
  state: { count: 10 },
  getters: {
    getCount: (state) => {
      return state.count;
    },
  },
  mutations: {
    INCREMENT(state) {
      state.count++;
    },
    DECREMENT(state) {
      state.count--;
    },
  },
  actions: {
    //test
    increment: ({ commit }) => {
      commit("INCREMENT");
    },
    decrement: ({ commit }) => {
      commit("DECREMENT");
    },
  },
  modules: {},
});
