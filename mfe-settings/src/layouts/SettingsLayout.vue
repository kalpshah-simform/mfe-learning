<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="mfe-settings-scope">
    <nav>
      <RouterLink to="/">
        Overview
      </RouterLink>
      |
      <RouterLink to="/preferences">
        Preferences
      </RouterLink>
    </nav>
    <RouterView />
  </div>
</template>
