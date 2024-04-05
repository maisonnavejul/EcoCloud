<template>
    <div class="file_wrapper">
        <PathViewer ref="path_viewer"/>
        <table class="file_viewer">
            <thead>
                <tr>
                    <th class="head_checkbox"></th>
                    <th class="head_type">Type</th>
                    <th class="head_name">Name</th>
                    <th class="head_size">Size</th>
                    <th class="head_created_on">Created On</th>
                </tr>
            </thead>
            <tbody>
                <FileViewerItem v-for="file in files" 
                                :name="file.name" 
                                :type="file.type"
                                :path="this.path" 
                                :size="file.size"
                                :created_on="file.created_on"
                                :key="file.name"
                                class="viewer_item"/>
            </tbody>
        </table>
    </div>
</template>

<script>
import FileViewerItem from './file_viewer_itm.component.vue';
import PathViewer from './path_viewer.component.vue';

const tmp_files = [
    {
        name: 'Grp2_6_fix_Path_traversal.patch',
        type: 'file',
        size: 3248,
        created_on: new Date('2022-01-01T00:00:00'),
    },
    {
        name: 'Grp2_6_Path_traversal.pdf',
        type: 'file',
        size: 12,
        created_on: new Date('2022-02-01T00:00:00'),
    },
    {
        name: 'GRP2_7_Faille_XSS.docx',
        type: 'file',
        size: 1480673,
        created_on: new Date('2022-03-01T00:00:00'),
    },
    {
        name: 'Folder 1',
        type: 'folder',
        size: 12788,
        created_on: new Date('2022-04-01T00:00:00'),
    },
    {
        name: 'Folder 2',
        type: 'folder',
        size: 145,
        created_on: new Date('2022-05-01T00:00:00'),
    },
];

export default {
    name: 'FileViewer',
    components: {
        FileViewerItem,
        PathViewer
    },
    data() {
        return {
            files: null,
            path: '../../../test_files/lab5/'
        }
    },

    methods: {
        get_files() {
            
        },
        get_files_offline() {
            this.files = tmp_files;
        }
    },

    mounted() {
        this.get_files();
        console.log(this.files);
        console.log(this.$refs.path_viewer.get_path());
    }
}
</script>

<style>
.file_viewer {
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: 15px;
}

.file_viewer > thead {
    text-align: left;
    height: 40px;
    padding: 10px 0; 
    font-size: 16px;
}

.file_viewer > tbody {
    width: auto;
}

.file_viewer > thead > * {
    width: auto;
    font-weight: 600;
    border-bottom: 1px solid #d3d3d3;
}

th {
    vertical-align: middle;
}

tbody > .viewer_item:hover {
    background-color: #d3d3d3;
    border-radius: 15px;
}

tbody > .viewer_item:not(:last-child) {
    border-bottom: 1px solid #d3d3d3;
}

tbody > .viewer_item:last-child > * {
    vertical-align: middle;
    font-weight: 500;
    border-bottom: 1px solid white;
}
</style>