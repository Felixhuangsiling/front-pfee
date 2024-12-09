<template>
  <div>
    <h1>Notes</h1>
    <p>Here are your notes:</p>
    <ul></ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const notes = ref([]);
</script>

<style scoped></style>
