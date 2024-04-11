<template>
    <div class="toolbar">
        <div class="left_toolbar">
            <ToolbarItem v-for="item in toolbar_items" 
                            :name="item.name" 
                            :callback="item.callback" 
                            :class="item.class"
                            :key="item.name"/>
        </div>
        <div class="admin_toolbar">
            <ToolbarItem v-if="this.$store.getters.get_user_state.is_admin"
                         v-for="item in admin_items"
                            :name="item.name"
                            :callback="item.callback"
                            :class="item.class"
                            :key="item.name"/>
        </div>
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
            ],
            admin_items: [
                {
                    name: 'Admin',
                    callback: this.go_admin,
                    class: '',
                }
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
        },
        go_admin() {
            this.$router.push('/admin');
        }
    },
}
</script>

<style>
.toolbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 20px;
}

.left_toolbar {
    display: flex;
    flex-direction: row;
    width: fit-content;
    margin-left: 20px;
}

.admin_toolbar {
    display: flex;
    flex-direction: row;
    width: fit-content;
    margin-right: 20px;
}


.file_uploader_btn {
    background-color: #335145;
    color: white; 
}
</style>