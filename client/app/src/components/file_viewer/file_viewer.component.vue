<template>
    <table class="file_viewer">
        <thead>
            <tr>
                <th class="head_checkbox"></th>
                <th class="head_type">Type</th>
                <th class="head_name">Name</th>
            </tr>
        </thead>
        <tbody>
            <FileViewerItem v-for="file in files" 
                            :name="file.name" 
                            :type="file.type"
                            :path="this.path" 
                            :key="file.name"/>
        </tbody>
    </table>
</template>

<script>
import FileViewerItem from './file_viewer_itm.component.vue';

const tmp_files = [
    {
        name: 'Grp2_6_fix_Path_traversal.patch',
        type: 'file'
    },
    {
        name: 'Grp2_6_Path_traversal.pdf',
        type: 'file'
    },
    {
        name: 'GRP2_7_Faille_XSS.docx',
        type: 'file'
    },
    {
        name: 'Folder 1',
        type: 'folder'
    },
    {
        name: 'Folder 2',
        type: 'folder'
    },
];

export default {
    name: 'FileViewer',
    components: {
        FileViewerItem
    },
    data() {
        return {
            files: null,
            path: '../../../test_files/lab5/'
        }
    },

    methods: {
        get_files() {
            this.files = tmp_files;
        }
    },

    mounted() {
        this.get_files();
        console.log(this.files);
    }
}
</script>

<style>
.file_viewer {
    width: 100%;
    padding: 50px 20px;
}

.file_viewer > thead {
    text-align: left;
}
.file_viewer > tbody {
    width: 100%;
}

.head_checkbox {
    width: 5%;
}

.head_type {
    width: 20%;
}

.head_name {
    width: 80%;
}
</style>