<template>
    <div class="admin_page">
        <div class="admin_page_content">
            <div class="go_back_admin" @click="this.$router.push('/')">
                <img src="../../assets/icons/tool_icons/left-arrow.png" alt="Back Arrow" />
                <p>Go back</p>
            </div>
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
import { get_user_list } from '../../assets/datasets/user.helper';

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
        offline_user_list() {
            this.user_list = get_user_list();
        },

        async get_user_list() {
            if (this.$store.state.is_offline) {
                this.offline_user_list();
                return;
            }

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
    align-items: center;
    width: 100%;
    height: fit-content;
}
.admin_page_content {
    width: fit-content;
    height: fit-content;
}

.go_back_admin {
    display: flex;
    align-items: center;
    margin-bottom: 17px;
    width: fit-content;
}

.go_back_admin:hover {
    cursor: pointer;
}

.go_back_admin img {
    width: 20px;
    height: 20px;
    margin-right: 5px;
}

.go_back_admin p {
    font-size: 18px;
    font-size: 600;
}

.user_list {
    margin-bottom: 12px;
}

.admin_add_user {
    display: flex;
    justify-content: center;
    align-items: center;
}

.admin_add_user_btn {
    width: 150px;
    height: 40px;
    background-color: #51BD8F;
    border: none;
    border-radius: 15px;
    font-size: 18px;
}
</style>