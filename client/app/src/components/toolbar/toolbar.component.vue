<template>
    <div class="toolbar">
        <ToolbarItem v-for="item in toolbar_items" 
                        :name="item.name" 
                        :callback="item.callback" 
                        :class="item.class"
                        :key="item.name"/>
    </div>
</template>

<script>
import ToolbarItem from './toolbar_itm.component.vue';

export default {
    name: 'Toolbar',
    components: {
        ToolbarItem
    },
    data() {
        return {
            toolbar_items: [
                {
                    name: 'Upload',
                    callback: this.upload,
                    class: 'file_uploader_btn',
                },
                {
                    name: 'Download',
                    callback: this.download,
                    class: 'downloader',
                },
                {
                    name: 'Delete',
                    callback: this.delete,
                    class: '',
                },
                {
                    name: 'Refresh',
                    callback: this.refresh,
                    class: '',
                },
            ]
        }
    },

    methods: {
        download() {
            this.$emit('download');
        },
        delete() {
            if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement les fichiers ?')) {
                this.$emit('delete');
            }
        },
        upload() {
            this.$emit('openFileUploaderModal');
        },
        refresh() {
            this.$emit('refresh');
        }
    },
}
</script>

<style>
.toolbar {
    display: flex;
    flex-direction: row;
    width: 430px;
    margin-bottom: 20px;
}

.file_uploader_btn {
    background-color: #335145;
    color: white; 
}
</style>