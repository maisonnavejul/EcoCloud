<template>
    <div class="home">
        <Toolbar />
        <FileViewer />
    </div>
</template>

<script>
import Toolbar from '../toolbar/toolbar.component.vue';
import FileViewer from '../file_viewer/file_viewer.component.vue';

export default {
    name: 'Home',
    components: {
        Toolbar,
        FileViewer
    },

    computed: {
        is_logged_in() {
            return this.$store.state.is_logged_in;
        }
    },

    data() {
        return {
        }
    },

    methods: {
        check_connection() {
            if (!this.is_logged_in) {
                this.$router.push('/login');
            }
        },
    },

    mounted() {
        this.check_connection();
    },
}
</script>