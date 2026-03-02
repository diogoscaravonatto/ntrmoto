<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    title: { type: String, default: 'Espere! Não vá embora ainda...' },
    description: { type: String, default: 'Temos uma oferta exclusiva para você fechar hoje mesmo.' },
    ctaText: { type: String, default: 'Quero meu Desconto' },
    ctaLink: { type: String, default: '#contact' },
    coupon: { type: String, default: 'SNIPER10' }
});

const isVisible = ref(false);
const hasTriggered = ref(false);

const closePopup = () => {
    isVisible.value = false;
};

const handleMouseLeave = (e) => {
    if (hasTriggered.value) return;

    // Verifica se o mouse saiu pelo topo da página (onde fecha a aba)
    if (e.clientY <= 0) {
        isVisible.value = true;
        hasTriggered.value = true;
    }
};

onMounted(() => {
    document.addEventListener('mouseleave', handleMouseLeave);
});

onUnmounted(() => {
    document.removeEventListener('mouseleave', handleMouseLeave);
});
</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="isVisible" class="fixed inset-0 z-100 flex items-center justify-center p-6">
                <!-- Overlay -->
                <div class="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" @click="closePopup"></div>

                <!-- Popup Card -->
                <div
                    class="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                    <!-- Color Bar -->
                    <div class="h-2 bg-linear-to-r from-violet-600 via-pink-600 to-orange-600"></div>

                    <div class="p-8 md:p-12 text-center">
                        <div
                            class="inline-flex size-16 bg-violet-600/10 text-violet-500 rounded-full items-center justify-center mb-6">
                            <svg class="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h2 class="text-3xl font-black text-white mb-4 tracking-tighter">
                            {{ title }}
                        </h2>

                        <p class="text-zinc-500 mb-8 leading-relaxed">
                            {{ description }}
                        </p>

                        <div v-if="coupon"
                            class="mb-8 p-4 bg-zinc-950 border border-dashed border-zinc-700 rounded-2xl">
                            <span
                                class="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1 text-center">Cupom
                                de Desconto</span>
                            <span class="text-2xl font-black text-white tracking-widest">{{ coupon }}</span>
                        </div>

                        <div class="flex flex-col gap-3">
                            <a :href="ctaLink"
                                class="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl transition-all shadow-[0_20px_40px_rgba(139,92,246,0.2)]"
                                @click="closePopup">
                                {{ ctaText }}
                            </a>

                            <button @click="closePopup"
                                class="text-zinc-600 hover:text-zinc-400 text-sm font-bold transition-colors">
                                Talvez mais tarde
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
