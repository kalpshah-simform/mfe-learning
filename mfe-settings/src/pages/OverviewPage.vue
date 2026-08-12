<script setup lang="ts">
import { inject, onMounted } from "vue";
import { sharedStoreKey } from "../shared-store-key";

const store = inject(sharedStoreKey);

onMounted(() => {
  console.log("shared/store __id in mfe-settings:", store?.__id);
});
</script>

<template>
  <div class="card">
    <h1>Settings Overview</h1>
    <p>Account preferences and configuration would go here.</p>
  </div>
</template>
