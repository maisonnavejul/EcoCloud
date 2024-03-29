<template>
    <table class="file_viewer">
        <thead>
            <tr>
                <th></th>
                <th>Name</th>
                <th>Type</th>
            </tr>
        </thead>
        <tbody>
            <FileViewerItem v-for="file in files" 
                            :name="file.name" 
                            :type="file.type" 
                            :key="file.name"/>
        </tbody>
    </table>
</template>

<script>
import FileViewerItem from './file_viewer_itm.component.vue';

import get_dirs_files from '../../scripts/helpers.js';

const tmp_files = [
    {
        name: 'File 1',
        type: 'file'
    },
    {
        name: 'File 2',
        type: 'file'
    },
    {
        name: 'File 3',
        type: 'folder'
    },
    {
        name: 'File 4',
        type: 'folder'
    },
    {
        name: 'File 5',
        type: 'file'
    },
];

export default {
    name: 'FileViewer',
    components: {
        FileViewerItem
    },
    data() {
        return {
            files: null
        }
    },

    methods: {
        async get_files() {
            const path = 'C:\\disque\\01-ISEN\\M1\\project\\EcoCloud\\client\\app\\test_files\\lab5';
            return await get_dirs_files(path);
        }
    },

    mounted() {
        this.files = this.get_files();
        console.log(this.files);
    }
}
</script>