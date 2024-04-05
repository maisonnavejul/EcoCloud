<template>
    <div class="home">
        <Toolbar @openFileUploaderModal="is_uploader_mod_open=true"
                 @download="handleDownload"
                 @delete="handleDelete"
                 @refresh="handleRefresh"/>
        <div class="home_viewer">
            <FileViewer ref="file_viewer"/>
        </div>
        <Modal v-if="is_uploader_mod_open" 
               @close="is_uploader_mod_open=false"
               @refresh="handleRefresh"/>
    </div>
</template>

<script>
import Toolbar from '../toolbar/toolbar.component.vue';
import FileViewer from '../file_viewer/file_viewer.component.vue';
import Modal from '../file_uploader/modal.component.vue';

export default {
    name: 'Home',
    components: {
        Toolbar,
        FileViewer,
        Modal
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

        async handleRefresh() {
            this.$refs.file_viewer.files = await this.$refs.file_viewer.get_files();
        },

        handleDownload() {
            this.$refs.file_viewer.download_files();
        }, 

        async handleDelete() {
            await this.$refs.file_viewer.delete_files();
        }
    },

    mounted() {
        this.check_connection();
    },
}
</script>


<style>
.home_viewer {
    height: 100%;
    width: 90%;
    margin: 0 5%;
}

</style>