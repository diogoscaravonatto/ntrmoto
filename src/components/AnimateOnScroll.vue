<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const target = ref(null)
const isVisible = ref(false)

useIntersectionObserver(
    target,
    ([{ isIntersecting }], observerElement) => {
        if (isIntersecting) {
            isVisible.value = true
            // Parar de observar após animar uma vez para performance
            observerElement.unobserve(target.value!)
        }
    },
    { threshold: 0.1 }
)
</script>

<template>
    <div ref="target" :class="[
        'reveal-container',
        isVisible ? 'reveal-active' : 'reveal-hidden'
    ]">
        <slot />
    </div>
</template>

<style scoped>
.reveal-container {
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal-hidden {
    opacity: 0;
    transform: translateY(40px);
    will-change: transform, opacity;
}

.reveal-active {
    opacity: 1;
    transform: translateY(0);
}
</style>
