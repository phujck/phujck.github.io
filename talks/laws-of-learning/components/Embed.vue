<!--
  Embed: drops a live standalone HTML asset into a slide by reference.
  This is the engine bet - the asset stays interactive (it is the real
  page shipping under viz/), not a baked frame. One component, any asset.
-->
<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

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

// Load the iframe only once its slide is on screen (and therefore sized).
// Native loading="lazy" misfires inside Slidev's CSS-scaled slide - the asset
// intermittently never loads. Eager loading is the opposite failure: every
// applet inits at a transient 0-size, where canvas draws throw (negative radii).
// An explicit IntersectionObserver loads each applet when its slide becomes
// active, reliably and at real size, and never reloads it.
const wrap = ref<HTMLElement | null>(null)
const show = ref(false)
let io: IntersectionObserver | null = null
onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') { show.value = true; return }
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { show.value = true; io?.disconnect(); io = null; break }
    }
  }, { rootMargin: '150px' })
  if (wrap.value) io.observe(wrap.value)
})
onBeforeUnmount(() => { io?.disconnect(); io = null })
</script>

<template>
  <div class="dyn-embed" ref="wrap" :style="{ minHeight: (height ?? 420) + 'px' }">
    <iframe
      v-if="show"
      :src="resolved"
      :height="height ?? 420"
      sandbox="allow-scripts allow-same-origin"
    />
  </div>
  <div v-if="caption" class="dyn-embed-caption">{{ caption }}</div>
</template>
