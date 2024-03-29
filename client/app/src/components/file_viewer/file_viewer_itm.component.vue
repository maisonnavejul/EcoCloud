<template>
    <tr class="file_viewer_itm" 
        @click="this.handle_click" 
        @dblclick="this.handle_dblclick">
        <td class="file_itm_checkbox">
            <input type="checkbox" v-model="is_selected"/>
        </td>
        <td class="file_itm_type">{{ type }}</td>
        <td class="file_itm_name">{{ name }}</td>
    </tr>
</template>

<script>
export default {
    name: 'FileViewerItem',
    data() {
        return {
            is_selected: false
        }
    },

    props: {
        path: {
            type: String,
            required: true 
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    },

    methods: {
        is_folder(type) {
            return type === 'folder';
        },

        handle_click() {
            this.is_selected = !this.is_selected;
        },

        handle_dblclick() {
            this.is_folder(this.type) ? this.open_folder() : this.view_file();
        },

        open_folder() {
            console.log('Open Folder');
        },  

        view_file() {
            // const path = `${this.path}/${this.name}`;
            const path = '../../../test_files/lab5/Grp2_6_Path_Traversal.pdf'
            window.open(path, '_blank');
            console.log('View File');
        }
    }
}
</script>