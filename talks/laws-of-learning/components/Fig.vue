<!--
  Fig: reuse a manuscript figure verbatim from /public by runtime reference.
  Runtime-bound :src keeps the bundler from resolving the public path as a
  module at build time. The figure is the manuscript's, unedited. Caption is
  authored as sibling markdown so it can carry KaTeX.
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ src: string; alt?: string }>()

// Resolve against the deploy base so the figure loads at `/` (dev) and under
// `/talks/<slug>/` (published), while staying runtime-bound (the bundler must
// not resolve the public path as a module at build time).
const resolved = computed(() => {
  const s = props.src
  if (/^https?:\/\//.test(s)) return s
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return s.startsWith('/') ? base + s : s
})
</script>

<template>
  <img class="reuse-fig" :src="resolved" :alt="alt" />
</template>
