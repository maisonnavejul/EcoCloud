import { createStore } from 'vuex';

export default createStore({
    state: {
        is_logged_in: false,
        user: null,
        cwd: '/test',
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
        CHANGEDIR(state, folder_name) {
            state.cwd = state.cwd + folder_name + '/';
        },
        BACKDIR(state) {
            state.cwd = state.cwd.substring(0, state.cwd.lastIndexOf('/'));
        },

    },

    actions: {
        login({ commit }, user) {
            commit('LOGIN', user);
        },
        logout({ commit }) {
            commit('LOGOUT');
        },
        change_dir({ commit }, folder_name) {
            commit('CHANGEDIR', folder_name);
        },
        back_dir({ commit }) {
            commit('BACKDIR');
        },
    },
});