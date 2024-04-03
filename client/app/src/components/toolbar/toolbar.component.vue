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
                    name: 'Add File',
                    callback: this.add_file,
                    class: 'file_adder',
                },
                {
                    name: 'Add Folder',
                    callback: this.add_folder,
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
        add_file() {
            console.log('Add File')
        },
        add_folder() {
            console.log('Add Folder');
        },
        upload() {
            this.$emit('openFileUploaderModal');
        },
        refresh() {
            console.log('Refresh');
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