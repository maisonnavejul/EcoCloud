<template>
    <header class="header">
        <div class="header_left">
            <div class="header_logo">
                <img alt="EcoCloud logo"
                     class="header_logo_img"
                     src="../../assets/logo/ecocloud-no-bg.png"
                     @click="this.$router.push('/')"/>
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
        async logout() {
            await this.$store.dispatch('logout');
            await this.$router.push('/login');
        }
    },
}
</script>


<style>
.header {
    display: flex;
    flex-direction: row;
    margin-bottom: 2%;
    margin-top: 7px;
    justify-content: space-between;
    height: 40px;
}

.header_left {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: fit-content;
    margin-left: 7px;
}

.header_title {
    font-size: 22px;
}

.header_logo {
    font-size: 12px;
    margin-right: 5px;
    height: 70px;
    width: 70px;
    display: flex;
    align-items: center;
    justify-self: center;
}

.header_logo_img {
    height: 100%;
    width: 100%;
}

.header_logo_img:hover {
    cursor: pointer;
}

.header_account_infos {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    max-width: 15%;
    margin-right: 12px;
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
