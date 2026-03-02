
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = withDefaults(defineProps<{
    targetDate?: string;
    title?: string;
    theme?: 'violet' | 'pink' | 'orange' | 'emerald';
}>(), {
    targetDate: () => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        return date.toISOString();
    },
    title: 'A oferta expira em:',
    theme: 'violet'
});

const timeLeft = ref({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
});

let timer: ReturnType<typeof setInterval> | null = null;

const updateCountdown = () => {
    const now = new Date().getTime();
    const target = new Date(props.targetDate || new Date().getTime()).getTime();
    const diff = target - now;

    if (diff <= 0) {
        if (timer) clearInterval(timer);
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    timeLeft.value = {
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
    };
};

onMounted(() => {
    updateCountdown();
    timer = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});

const themes: Record<string, string> = {
    violet: 'from-violet-500 to-violet-700',
    pink: 'from-pink-500 to-pink-700',
    orange: 'from-orange-500 to-orange-700',
    emerald: 'from-emerald-500 to-emerald-700',
};
</script>

<template>
    <div class="flex flex-col items-center gap-6 py-12 px-6">
        <h3 v-if="title" class="text-zinc-400 font-bold uppercase tracking-widest text-sm text-center">
            {{ title }}
        </h3>

        <div class="flex gap-4 md:gap-8 justify-center items-center">
            <!-- Days -->
            <div class="flex flex-col items-center">
                <div
                     :class="['text-4xl md:text-6xl font-black bg-linear-to-b bg-clip-text text-transparent w-20 md:w-28 text-center', themes[theme || 'violet']]">
                    {{ timeLeft.days }}
                </div>
                <span class="text-[10px] md:text-sm font-bold text-zinc-600 uppercase tracking-tighter">Dias</span>
            </div>

            <span class="text-3xl md:text-5xl font-black text-zinc-800 -mt-6">:</span>

            <!-- Hours -->
            <div class="flex flex-col items-center">
                <div
                     :class="['text-4xl md:text-6xl font-black bg-linear-to-b bg-clip-text text-transparent w-20 md:w-28 text-center', themes[theme || 'violet']]">
                    {{ timeLeft.hours }}
                </div>
                <span class="text-[10px] md:text-sm font-bold text-zinc-600 uppercase tracking-tighter">Horas</span>
            </div>

            <span class="text-3xl md:text-5xl font-black text-zinc-800 -mt-6">:</span>

            <!-- Minutes -->
            <div class="flex flex-col items-center">
                <div
                     :class="['text-4xl md:text-6xl font-black bg-linear-to-b bg-clip-text text-transparent w-20 md:w-28 text-center', themes[theme || 'violet']]">
                    {{ timeLeft.minutes }}
                </div>
                <span class="text-[10px] md:text-sm font-bold text-zinc-600 uppercase tracking-tighter">Minutos</span>
            </div>

            <span class="text-3xl md:text-5xl font-black text-zinc-800 -mt-6">:</span>

            <!-- Seconds -->
            <div class="flex flex-col items-center">
                <div
                     :class="['text-4xl md:text-6xl font-black bg-linear-to-b bg-clip-text text-transparent w-20 md:w-28 text-center', themes[theme || 'violet']]">
                    {{ timeLeft.seconds }}
                </div>
                <span class="text-[10px] md:text-sm font-bold text-zinc-600 uppercase tracking-tighter">Segundos</span>
            </div>
        </div>
    </div>
</template>
