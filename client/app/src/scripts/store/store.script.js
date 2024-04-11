import { createStore } from 'vuex';

export default createStore({
    state: {
        is_offline: false, // set true if backend server is offline
        is_logged_in: false,
        user: null,
        cwd: '/',
    },

    getters: {
        get_login_state(state) {
            return state.login;
        },

        get_user_state(state) {
            return state.user;
        },

        get_cwd_state(state) {
            return state.cwd
        }

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
        GET_USER(state) {
            return this.getters.get_user_state;
        }

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
        get_user({ commit }) {
            commit('GET_USER');
        }
    },
});