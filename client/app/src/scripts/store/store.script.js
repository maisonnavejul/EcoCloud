import { createStore } from 'vuex';

export default createStore({
    state: {
        is_offline: false, // set true if backend server is offline
        is_logged_in: false,
        user: null,
        cwd: '/',
        checked_files: [],
        previous_route: null,
        is_moving: false,
        moving_file: null,
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
            state.cwd = '/';
            state.checked_files = [];
            state.previous_route = null;
            state.is_moving = false;
            state.moving_file = null;
        },
        CHANGEDIR(state, new_path) {
            state.cwd = new_path;
        },
        GET_USER(state) {
            return this.getters.get_user_state;
        },
        SET_PREVIOUS_ROUTE(state, route) {
            state.previous_route = route;
        },
        SET_MOVING(state, value) {
            state.is_moving = value;
        },
        SET_FILE_MOVING(state, file) {
            state.moving_file = file;
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
        },
        set_moving({ commit }, value) {
            commit('SET_MOVING', value);
        },
        set_moving_file({ commit }, file) {
            commit('SET_FILE_MOVING', file);
        }
    },
});