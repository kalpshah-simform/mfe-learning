<script setup lang="ts">
import { onMounted } from "vue";
import { store } from "shared/store";

onMounted(() => {
  console.log("shared/store __id in mfe-settings:", store.__id);
});
</script>

<template>
  <div class="card">
    <h1>Settings Overview</h1>
    <p>Account preferences and configuration would go here.</p>
  </div>
</template>
