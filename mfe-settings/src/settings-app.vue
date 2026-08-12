<script setup lang="ts">
import { provide } from "vue";
import { RouterView } from "vue-router";
import { sharedStoreKey } from "./shared-store-key";
import type { store as SharedStoreType } from "shared/store";

const props = defineProps<{ store: typeof SharedStoreType }>();
provide(sharedStoreKey, props.store);
</script>

<template>
  <RouterView />
</template>
