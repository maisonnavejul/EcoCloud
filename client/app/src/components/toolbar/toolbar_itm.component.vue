<template>
    <div class="toolbar_itm">
        <button @click="execute" class="toolbar_itm_button">{{ name }}</button>
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
            required: false
        },
        name: {
            type: String,
            required: true
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