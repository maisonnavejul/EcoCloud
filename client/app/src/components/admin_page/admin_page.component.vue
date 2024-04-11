<template>
    <div class="admin_page">
        <div class="admin_page_content">
            <div class="user_list">
                <UserItem v-for="user in user_list"
                            :username="user.username"
                            :email="user.email"
                            :firstname="user.firstname"
                            :lastname="user.lastname"
                            :is_admin="user.is_admin"
                            :key="user.id"
                            @refresh="get_user_list"/>
            </div>
            <div class="admin_add_user">
                <button class="admin_add_user_btn" @click="this.$router.push('/adduser')">Add User</button>
            </div>
        </div>
    </div>
</template>

<script>
import UserItem from '../user_viewer/user_viewer.component.vue';
export default {
    name: 'Admin',

    components: {
        UserItem
    },

    data() {
        return {
            user_list: [],
        }
    },

    methods: {
        async get_user_list() {
            const response = await fetch('http://207.180.204.159:8080/list-users');

            const data = await response.json();
            console.log('Data: ', data);

            this.user_list = data;
        },
    },

    mounted() {
        this.get_user_list();
    }
}
</script>

<style>
.admin_page{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}
.admin_page_content {
    width: fit-content;
    height: fit-content;
}
</style>