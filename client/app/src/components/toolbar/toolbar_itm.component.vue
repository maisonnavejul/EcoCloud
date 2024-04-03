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
}

.toolbar_itm > button {
    border-radius: 10px;
    border: 1px solid #d9d9d9;
    height: 26px;
    width: 100px;
    font-size: 14px;
}
</style>