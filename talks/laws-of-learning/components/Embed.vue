<!--
  Embed: drops a live standalone HTML asset into a slide by reference.
  This is the engine bet - the asset stays interactive (it is the real
  page shipping under viz/), not a baked frame. One component, any asset.
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src: string
  height?: number
  caption?: string
}>()

// Resolve a root-relative public path against the deck's deploy base so the
// embed works both at `/` (dev) and under `/talks/<slug>/` (published). An
// external URL (the live localhost viewer upgrade) is passed through untouched.
const resolved = computed(() => {
  const s = props.src
  if (/^https?:\/\//.test(s)) return s
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return s.startsWith('/') ? base + s : s
})
</script>

<template>
  <div class="dyn-embed">
    <iframe
      :src="resolved"
      :height="height ?? 420"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin"
    />
  </div>
  <div v-if="caption" class="dyn-embed-caption">{{ caption }}</div>
</template>
