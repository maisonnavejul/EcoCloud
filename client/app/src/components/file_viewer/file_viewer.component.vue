<template>
    <div class="file_wrapper">
        <PathViewer ref="path_viewer" @parent="handleParent"/>
        <div class="no_file_viewer" v-if="this.files.length === 0">  
            <p>No file uploaded yet</p>
        </div>
        <table class="file_viewer" v-if="this.files.length > 0">
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
                                :path="file.path" 
                                :size="file.size"
                                :created_on="file.createdAt"
                                :on_remote="file.onRemoteStorage"
                                :key="file.name"
                                @navigate="handleNavigate"
                                @check="handleCheck(file)"
                                @uncheck="handleUncheck(file)"
                                @refresh="this.$emit('refresh')"
                                class="viewer_item"/>
            </tbody>
        </table>
    </div>
</template>

<script>
import FileViewerItem from './file_viewer_itm.component.vue';
import PathViewer from './path_viewer.component.vue';
import file_dataset from '../../assets/datasets/file.dataset';

const tmp_files = file_dataset;

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
        map_files(files) {
            return files.map(file => {
                return {
                    ...file,
                    path: `${this.$store.state.cwd}${file.name}`
                }
            });
        },

        async get_files() {
            if (this.$store.state.is_offline) return this.get_files_offline();

            try {
                const username = this.$store.getters.get_user_state.username;
                const path = this.$store.state.cwd;

                const req = new Request(`http://207.180.204.159:8080/list-files/${username}?path=${encodeURIComponent(path)}`) 

                const response = await fetch(req);

                if (!response.ok) throw new Error("Error while fetching files")
                   
                const json = await response.json();
                const files = this.map_files(json);

                return files;

            } catch (error) {
                console.error('Erreur lors de la récupération des fichiers:', error);
            }
        },

        get_files_offline() {
            return tmp_files;
        },

        async handleNavigate(path) {
            const new_path = `${this.$store.state.cwd}${path}/`;
            this.$store.dispatch('change_dir', new_path);
            this.files = await this.get_files();
        },

        async handleParent(path) {
            this.$store.dispatch('change_dir', path);
            this.files = await this.get_files();
        },


        handleCheck(file) {
            this.$store.state.checked_files.push(file);
            console.log(this.$store.state.checked_files);
        },

        handleUncheck(file) {
            const tmp = this.$store.state.checked_files
            this.$store.state.checked_files = [];
            tmp.forEach((f, index) => {
                if (f.name !== file.name) {
                    this.$store.state.checked_files.push(f);
                }
            });
            console.log(this.$store.state.checked_files);
        },

        download_files() {
            let index = 0;
            this.$store.state.checked_files.forEach(file => {
                index += 1;
                const username = this.$store.state.user.username;
                const path = `${username}${this.$store.state.cwd}/${file.name}`;
                const url = `http://207.180.204.159:3000/download?path=${encodeURIComponent(path)}`

                const link = document.createElement('a');
                link.href = url;
                link.download = file.name;
                link.style.display = 'none';

                document.body.appendChild(link);

                link.click();
                
                document.body.removeChild(link);
            });
        },


        // TODO: Remove this method if new solution is working on real environment
        // download_files() {
        //     let index = 0;
        //     const windows = [];
        //     this.$store.state.checked_files.forEach(file => {
        //         index += 1;
        //         const username = this.$store.state.user.username;
        //         const path = `${username}${this.$store.state.cwd}/${file.name}`;
        //         const url = `http://207.180.204.159:3000/download?path=${encodeURIComponent(path)}`;
        //         const win = window.open('', '_blank');
        //         windows.push(win);
                
        //         setTimeout(() => {
        //             try {
        //                 win.location = url;
        //             } catch (error) {
        //                 console.log('Erreur lors du téléchargement des fichiers')
        //             }
        //         }, index * 1000);
        //     });
        // },

        async move_files() {
            const old_path = `/${this.$store.state.user.username}${this.$store.state.moving_file.path}`;
            let new_path = `/${this.$store.state.user.username}${this.$store.state.cwd}${this.$store.state.moving_file.name}`;
            new_path = new_path.endsWith('/') ? new_path.substring(0, new_path.length - 1) : new_path;
            const body = JSON.stringify({
                oldPath: old_path,
                newPath: new_path,
            });

            const req = new Request('http://207.180.204.159:8080/move-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body
            });
            console.log('MOVE FILES BODY', body);
            console.log('MOVE FILES REQ', req);

            const res = await fetch(req);
            console.log('MOVE FILES RES', res);
        },

        async delete_files() {
            await this.$store.state.checked_files.forEach(async file =>{
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
                this.files.sort((a, b) => {
                    const da = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
                    const db = typeof b.createdAt === 'string'? new Date(b.createdAt) : b.createdAt;
                    const diff = da - db;
                    return diff;
                });
                this.sort_order = 'desc';
            } else {
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
    height: 45px;
    padding: 10px 0; 
    font-size: 17px;
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
    color: #1A281F;
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
    cursor: pointer;
}

tbody > .viewer_item:not(:last-child) {
    border-bottom: 1px solid #d3d3d3;
}

tbody > .viewer_item:last-child > * {
    border-bottom: 1px solid white;
}

.no_file_viewer {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: larger;
}
</style>