<template>
  <div class="ecocloud">
    <Header />
    <router-view />
  </div>
</template>

<script>
import './assets/css/reset.css';
// Import Components
import Header from './components/header/header.component.vue';

export default {
  components: {
    Header
  },
}
</script>


<style>
html, #app, .ecocloud {
  width: 100%;
  height: 100%;
}

body {
  padding: 0;
  margin: 0;
  background-color: #e3e0e6;
  color: #303030;
  font-family: -apple-system, BlinkMacSystemFont, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  width: 100%;
  height: 100%;
}

</style>