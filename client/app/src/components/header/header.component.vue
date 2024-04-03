<template>
    <header class="header">
        <div class="header_left">
            <div class="header_logo">
                <img alt="EcoCloud logo"/>
            </div>
            <h1 class="header_title">EcoCloud</h1>
        </div>
        <div class="header_account" v-if="this.is_logged_in">{{ user_account }}</div>
    </header>
</template>


<script>
export default {
    name: 'Header',
    data() {
        return {
            user_account: null
        }
    },

    methods: {
        is_logged_in() {
            if (this.$store.state.is_logged_in) {
                this.user_account = this.$store.state.user.emails;
                return true;
            } else {
                return false;
            }
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
}

.header_left {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    max-width: 15%;
}

.header_title {
    font-size: 20px;
}

.header_logo {
    font-size: 12px;
}

</style>
