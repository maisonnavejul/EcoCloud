<template>
    <div class="toolbar_itm">
        <button @click="execute" class="toolbar_itm_button" v-bind:class="class">{{ name }}</button>
    </div>
</template>

<script>
export default {
    name: 'ToolbarItem',
    data() {
        return {
        }
    },
    props: {
        callback: {
            type: Function,
            required: false,
        },
        name: {
            type: String,
            required: true,
        },
        class: {
            type: String,
            required: false,
        }
    },

    methods: {
        execute() {
            if (this.callback) {
                this.callback();
            } else {
                console.log('No callback defined');
            }
            
        }
    }
}
</script>

<style>
.toolbar_itm {
    height: 100%;
    width: 100%;

    margin-right: 3px;
}

.toolbar_itm > button {
    height: 30px;
    width: 100px;

    border-radius: 15px;
    border: 1px solid #a9a9a9;
    font-size: 15px;
}
</style>