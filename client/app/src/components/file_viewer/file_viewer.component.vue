<template>
    <div class="file_wrapper">
        <PathViewer ref="path_viewer" @parent="handleParent"/>
        <table class="file_viewer">
            <thead>
                <tr class="head_row">
                    <th class="head_checkbox">
                        <input type="checkbox" @click="check_all"/>
                    </th>
                    <th class="head_type" @click="sort_column('type')">
                        Type
                    </th>
                    <th class="head_name" @click="sort_column('name')">Name</th>
                    <th class="head_size" @click="sort_column('size')">Size</th>
                    <th class="head_created_on" @click="sort_column('created_on')">Created On</th>
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
        createdAt: new Date('2022-01-01T00:00:00'),
    },
    {
        name: 'Grp2_6_Path_traversal.pdf',
        type: 'file',
        size: 12,
        createdAt: new Date('2022-02-01T00:00:00'),
    },
    {
        name: 'GRP2_7_Faille_XSS.docx',
        type: 'file',
        size: 1480673,
        createdAt: new Date('2022-03-01T00:00:00'),
    },
    {
        name: 'Folder 1',
        type: 'folder',
        size: 12788,
        createdAt: new Date('2022-04-01T00:00:00'),
    },
    {
        name: 'Folder 2',
        type: 'folder',
        size: 145,
        createdAt: new Date('2022-05-01T00:00:00'),
    },
    {
        name: 'Grp2_6_fix_Path_traversal.zip',
        type: 'folder',
        size: 32,
        createdAt: new Date('2022-01-01T00:00:00'),
    },
    {
        name: 'ecocloud.pptx',
        type: 'file',
        size: 1053000,
        createdAt: new Date('2022-01-01T00:00:00'),
    },
    {
        name: 'ecocloud_logo.svg',
        type: 'file',
        size: 12398723,
        createdAt: new Date('2024-04-06T13:45:57'),
    },
    {
        name: 'ecocloud_logo.png',
        type: 'file',
        size: 1239872,
        createdAt: new Date('2024-04-06T13:46:37'),
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
            sort_order: "asc",
            are_all_checked: false,
            path: '../../../test_files/lab5/',
            checked_files: []
        }
    },

    async created() {
        this.files = await this.get_files();
    },

    methods: {
        async get_files() {
            if (this.$store.state.is_offline) return this.get_files_offline();

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

        get_files_offline() {
            return tmp_files;
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
        },

        sort_column(field) {
            switch(field) {
                case 'name':
                    this.sort_by_name();
                    break;
                case 'type':
                    this.sort_by_type();
                    break;
                case 'size':
                    this.sort_by_size();
                    break;
                case 'created_on':
                    this.sort_by_date();
                    break;
            }

        },

        sort_by_name() {
            console.log('sort by name');
            if (this.sort_order === 'asc') {
                this.files.sort((a, b) => a.name.localeCompare(b.name));
                this.sort_order = 'desc';
            } else {
                this.files.sort((a, b) => b.name.localeCompare(a.name));
                this.sort_order = 'asc';
            }
        },
        
        sort_by_size() {
            let folders = this.files.filter(file => file.type === 'folder');
            let files = this.files.filter(file => file.type === 'file');

            if (this.sort_order === 'asc') {
                folders.sort((a, b) => a.size - b.size);
                files.sort((a, b) => a.size - b.size); 
                this.sort_order = 'desc';
            } else {
                folders.sort((a, b) => b.size - a.size);
                files.sort((a, b) => b.size - a.size);
                this.sort_order = 'asc';
            }

            this.files = [...folders, ...files];
        },

        sort_by_type() {
            let folders = this.files.filter(file => file.type === 'folder');
            let files = this.files.filter(file => file.type === 'file');

            if (this.sort_order === 'asc') {
                folders.sort((a, b) => {
                    const ext_a = a.name.split('.').pop();
                    const ext_b = b.name.split('.').pop();
                    return ext_a.localeCompare(ext_b);
                })
                files.sort((a, b) => {
                    const ext_a = a.name.split('.').pop();
                    const ext_b = b.name.split('.').pop();
                    return ext_a.localeCompare(ext_b);
                });
                this.sort_order = 'desc';
            } else {
                folders.sort((a, b) => {
                    const ext_a = a.name.split('.').pop();
                    const ext_b = b.name.split('.').pop();
                    return ext_b.localeCompare(ext_a);
                })
                files.sort((a, b) => {
                    const ext_a = a.name.split('.').pop();
                    const ext_b = b.name.split('.').pop();
                    return ext_b.localeCompare(ext_a);
                });
                this.sort_order = 'asc';
            }

            this.files = [...folders, ...files];
        },

        sort_by_date() {
            if (this.sort_order === 'asc') {
                console.log('asc');
                this.files.sort((a, b) => {
                    const da = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
                    const db = typeof b.createdAt === 'string'? new Date(b.createdAt) : b.createdAt;
                    const diff = da - db;
                    return diff;
                });
                this.sort_order = 'desc';
            } else {
                console.log('desc');
                this.files.sort((a, b) => {
                    const da = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
                    const db = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
                    const diff = db - da;
                    return diff;
                });
                this.sort_order = 'asc';
            }
        },
    },

    mounted() {
        console.log('mounted');
        this.sort_by_name();
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

.head_row:hover > .head_checkbox > input[type="checkbox"] {
    border: 1px solid #3a3a3a;
}

.file_viewer > tbody {
    width: auto;
}

.file_viewer > thead > * {
    width: auto;
    font-weight: 600;
    border-bottom: 1px solid #d3d3d3;
}

.head_checkbox {
    text-align: center;
}
.head_checkbox > input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    outline: none;
    position: relative;
    border: 1px solid white;
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