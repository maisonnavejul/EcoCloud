<template>
    <div class="path_viewer">
        <div class="path_element" v-for="path_el in get_path()">
            <p class="folder" @click="$emit('parent', path_el.path)">{{ path_el.label }}</p>
            <p class="separator">></p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PathViewer',

    methods: {
        get_path() {
            let cwd = this.$store.state.cwd;
            if (cwd.endsWith('/')) {
                cwd = cwd.substring(0, cwd.length - 1);
            }

            const spt = cwd.split('/').slice(-2);
            console.log('PATH_VIEWER: ', cwd, spt.length, spt)

            if (spt[1] === '') {
                return [{ label: 'Home', path: '/' }];
            } else if (spt[0] === ''){
                return [
                    { label: 'Home', path: '/' },
                    { label: spt[1], path: cwd }
                ]
            } else {
                return [
                    { label: spt[0], path: cwd.substring(0, cwd.lastIndexOf(spt[0]))},
                    { label: spt[1], path: cwd }
                ]
            }
        }
    },

    mounted() {
        this.get_path();
    }
}
</script>

<style>
.path_viewer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding: 0 20px;
    margin-bottom: 10px;
}

.path_element {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
}

.path_element > * {
    font-weight: 600;
    font-size: 18px;
    margin-right: 7px;
}

.path_element:last-child > .separator {
    display: none;
}

.path_element > .folder {
    padding: 5px; 
}
.path_element > .folder:hover {
    cursor: pointer;
    text-decoration: underline;
    background-color: #b0b0b0;
    border-radius: 5px;
}


</style>