<script>
export default {
    name: 'Header',
    data() {
        return {
            is_logged: false,
        }
    },

    methods: {
        
    },

    mounted() {
        console.log('Header.vue mounted');
    }
}
</script>

<template>
    <header class="header">
        <h1 class="header__title">EcoCloud</h1>
        <div class="header__logo">
            <img alt="EcoCloud logo"/>
        </div>
    </header>
</template>

<style>
</style>
