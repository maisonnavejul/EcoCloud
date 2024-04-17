<template>
    <div class="toolbar">
        <div class="left_toolbar" v-if="!this.$store.state.is_moving">
            <template v-for="item in toolbar_items">
                <ToolbarItem :name="item.name" 
                             :callback="item.callback" 
                             :class="item.class"
                             :key="item.name"
                             v-if="!item.requires_selection || this.$store.state.checked_files.length > 0"/>
            </template>
        </div>
        <div class="moving_toolbar" v-else>
            <template v-for="item in moving_items">
                <ToolbarItem :name="item.name" 
                             :callback="item.callback" 
                             :class="item.class"
                             :key="item.name"
                             v-if="!item.requires_selection || this.$store.state.checked_files.length > 0"/>
            </template>
        </div>
        <div class="admin_toolbar">
            <ToolbarItem v-if="this.$store.getters.get_user_state && this.$store.getters.get_user_state.is_admin"
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
                    requires_selection: false,
                },
                {
                    name: 'Download',
                    callback: this.download,
                    class: 'downloader',
                    requires_selection: true,
                },
                {
                    name: 'Delete',
                    callback: this.delete,
                    class: '',
                    requires_selection: true,
                },
                {
                    name: 'Refresh',
                    callback: this.refresh,
                    class: '',
                    requires_selection: false,
                },
            ],
            moving_items: [
                {
                    name: 'Move Here',
                    callback: this.move_here,
                    class: 'move_files_btn',
                    requires_selection: false,
                },
                {
                    name: 'Cancel',
                    callback: this.cancel_move,
                    class: '',
                    requires_selection: false,
                }
            ],
            admin_items: [
                {
                    name: 'Admin',
                    callback: this.go_admin,
                    class: '',
                    requires_selection: false,
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
        },

        move_here() {
            this.$emit('move_here');
        },
        cancel_move() {
            this.$emit('cancel_move');
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

.moving_toolbar {
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


.file_uploader_btn, .move_files_btn{
    background-color: #51BD8F;
}
</style>