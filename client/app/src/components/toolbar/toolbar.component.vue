<template>
    <div class="toolbar">
        <ToolbarItem v-for="item in toolbar_items" 
                        :name="item.name" 
                        :callback="item.callback" 
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
                    name: 'Add File',
                    callback: this.add_file,
                },
                {
                    name: 'Add Folder',
                    callback: this.add_folder,
                },
                {
                    name: 'Upload',
                    callback: this.upload,
                },
                {
                    name: 'Refresh',
                    callback: this.refresh,
                },
            ]
        }
    },

    methods: {
        add_file() {
            console.log('Add File');
        },
        add_folder() {
            console.log('Add Folder');
        },
        upload() {
            console.log('Upload');
        },
        refresh() {
            console.log('Refresh');
        }
    },
}
</script>