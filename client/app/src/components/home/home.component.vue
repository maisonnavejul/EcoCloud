<template>
    <div class="home">
        <Toolbar @openFileUploaderModal="is_uploader_mod_open=true"/>
        <FileViewer />
        <FileUploaderModal v-if="is_uploader_mod_open" @close="is_uploader_mod_open=false"/>
    </div>
</template>

<script>
import Toolbar from '../toolbar/toolbar.component.vue';
import FileViewer from '../file_viewer/file_viewer.component.vue';
import FileUploaderModal from '../file_uploader/modal.component.vue';

export default {
    name: 'Home',
    components: {
        Toolbar,
        FileViewer,
        FileUploaderModal
    },

    computed: {
        is_logged_in() {
            return this.$store.state.is_logged_in;
        }
    },

    data() {
        return {
            is_uploader_mod_open: false
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
