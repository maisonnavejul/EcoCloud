<template>
    <div class="tooltip">
        <img src="../../assets/icons/support.png" ref="img" />
    </div>
</template>

<script>
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export default {
    props: {
        content: {
            type: String, 
            required: true,
        }
    },

    name: 'Tooltip',

    mounted() {
        tippy(this.$refs.img, {
            content: this.content,
        });
    },
};
</script>

<style>
.tooltip > img {
    width: 15px;
    height: 15px;
}
</style>