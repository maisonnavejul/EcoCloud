import { createStore } from 'vuex';

export default createStore({
    state: {
        is_logged_in: false,
        user: null,
    },

    mutations: {
        LOGIN(state, user) {
            state.is_logged_in = true;
            state.user = user;
        },
        LOGOUT(state) {
            state.is_logged_in = false;
            state.user = null;
        }
    },

    actions: {
        login({ commit }, user) {
            commit('LOGIN', user);
        },
        logout({ commit }) {
            commit('LOGOUT');
        }
    },
});