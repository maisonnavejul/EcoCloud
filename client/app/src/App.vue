<template>
  <div class="ecocloud">
    <Header />
    <router-view />
  </div>
</template>

<script>
// Import Components
import Header from './components/header/header.component.vue';

export default {
  components: {
    Header
  },
  data() {
    return {
    }
  },

  methods: {
  },

  mounted() {
    console.log('App.vue mounted');
  }
}
</script>


<style>
</style>