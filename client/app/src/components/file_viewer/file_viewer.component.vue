<template>
    <div class="file_wrapper">
        <PathViewer ref="path_viewer" @parent="handleParent"/>
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
                                :type="file.type.toLowerCase()"
                                :path="this.path" 
                                :size="file.size"
                                :created_on="file.createdAt"
                                :key="file.name"
                                @navigate="handleNavigate"
                                @check="handleCheck(file)"
                                @uncheck="handleUncheck(file)"
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
            files: [],
            path: '../../../test_files/lab5/',
            checked_files: []
        }
    },

    async created() {
        this.files = await this.get_files();
    },

    methods: {
        async get_files() {
            try {
                const path = this.$store.state.cwd;
                console.log('PATH', path);
                const response = await fetch(`http://207.180.204.159:3000/test-recup?path=${encodeURIComponent(path)}`);
                
                if (!response.ok) throw new Error("Error while fetching files")
                   
                const json = await response.json();

                return json;

            } catch (error) {
                console.error('Erreur lors de la récupération des fichiers:', error);
            }
        },

        async handleNavigate(path) {
            const new_path = `${this.$store.state.cwd}/${path}/`;
            this.$store.dispatch('change_dir', new_path);
            this.files = await this.get_files();
        },

        async handleParent(path) {
            this.$store.dispatch('change_dir', path);
            this.files = await this.get_files();
        },

        get_files_offline() {
            return tmp_files;
        },

        handleCheck(file) {
            this.checked_files.push(file);
            console.log(this.checked_files);
        },

        handleUncheck(file) {
            const tmp = this.checked_files
            this.checked_files = [];
            tmp.forEach((f, index) => {
                if (f.name !== file.name) {
                    this.checked_files.push(f);
                }
            });
            console.log(this.checked_files);
        },

        download_files() {
            this.checked_files.forEach(file => {
                const path = `${this.$store.state.cwd}/${file.name}`;
                const url = `http://207.180.204.159:3000/download?path=${encodeURIComponent(path)}`;
                try {
                    window.open(url, '_blank');
                } catch (error) {
                    console.log('Erreur lors du téléchargement des fichiers')
                }
            });
        },

        async delete_files() {
            await this.checked_files.forEach(async file =>{
                const path = `${this.$store.state.cwd}/${file.name}`;
                const response = await fetch('http://207.180.204.159:3000/delete-file', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                    body: JSON.stringify({ filePath: path }),
                });
            });
        }
    },

    mounted() {
        console.log('mounted');
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