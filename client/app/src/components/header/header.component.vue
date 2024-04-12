<template>
    <header class="header">
        <div class="header_left">
            <div class="header_logo">
                <img alt="EcoCloud logo"/>
            </div>
            <h1 class="header_title">EcoCloud</h1>
        </div>
        <div class="header_account_infos">
            <h2 class="header_account" 
                v-if="this.$store.state.is_logged_in"
                @click="this.$router.push('/register')" >{{ this.$store.state.user.username }}</h2>
            <img class="header_logout_btn"
                 alt="logout button"
                 src="../../assets/icons/tool_icons/logout.png"
                 v-if="this.$store.state.is_logged_in"
                 @click="logout"/>
        </div>
    </header>
</template>


<script>
export default {
    name: 'Header',
    data() {
        return {
        }
    },

    methods: {
        logout() {
            this.$store.dispatch('logout');
            this.$router.push('/login');
        }
    },

    mounted() {
        console.log('Header.vue mounted');
    }
}
</script>


<style>
.header {
    display: flex;
    flex-direction: row;
    margin-bottom: 2%;
    justify-content: space-between;
    height: 40px;
}

.header_left {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    max-width: 15%;
    margin-left: 7px;
}

.header_title {
    font-size: 22px;
}

.header_logo {
    font-size: 12px;
    margin-right: 5px;
}

.header_account_infos {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    max-width: 15%;
    margin-right: 47px;
}

.header_account {
    font-size: 18px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.header_logout_btn {
    width: 22%;
    height: 22px;
    margin-right: 10px;
    cursor: pointer;
}
</style>
