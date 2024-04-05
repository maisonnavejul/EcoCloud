import { createStore } from 'vuex';

export default createStore({
    state: {
        is_logged_in: false,
        user: null,
        cwd: '/',
    },

    mutations: {
        LOGIN(state, user) {
            state.is_logged_in = true;
            state.user = user;
        },
        LOGOUT(state) {
            state.is_logged_in = false;
            state.user = null;
        },
        CHANGEDIR(state, new_path) {
            state.cwd = new_path;
        },

    },

    actions: {
        login({ commit }, user) {
            commit('LOGIN', user);
        },
        logout({ commit }) {
            commit('LOGOUT');
        },
        change_dir({ commit }, new_path) {
            commit('CHANGEDIR', new_path);
        },
    },
});