<template>
    <div class="header_container">
        <Nav />
    </div>
</template>

<style lang="scss" scoped>
    @use "../../../styles/colors" as *;
    
    .header_container {
        background-color: $primary;
        color: $white;
        font-size: 1em;
        width: 100%;
        display: flex;
        padding: 1rem;
    }
</style>

<script lang="ts" setup>
import Nav from '../nav/ Nav.vue'; 
</script>