<script setup lang="ts">
import { ref, computed, useSlots } from 'vue';
import { animate, stagger } from 'motion';
import { useStore } from '@nanostores/vue';
import { isDarkMode, toggleTheme } from '@/stores/themeStore';

interface Item {
    id: string;
    name: string;
    path: string;
    slug: string;
    description: string;
    category: string;
    icon: string;
    color: string;
    bg: string;
    stepsCount?: number;
    steps?: { name: string; path: string }[];
}

const props = defineProps<{
    pages: Item[];
    components: Item[];
    funnels: Item[];
}>();

const slots = useSlots();
const activeTab = ref<'pages' | 'components' | 'funnels'>('pages');
const activeCategory = ref('Todos');
const selectedItem = ref<Item | null>(null);
const isModalOpen = ref(false);
const previewWidth = ref<'desktop' | 'tablet' | 'mobile'>('desktop');

// Usar store global de tema (nanostores)
const isDark = useStore(isDarkMode);

const currentItems = computed(() => {
    if (activeTab.value === 'pages') return props.pages;
    if (activeTab.value === 'components') return props.components;
    return props.funnels || [];
});

const previewStyles = computed(() => {
    switch (previewWidth.value) {
        case 'mobile':
            return { width: '425px', height: '100%', margin: '0 auto' };
        case 'tablet':
            return { width: '768px', height: '100%', margin: '0 auto' };
        default:
            return { width: '100%', height: '100%' };
    }
});

const categories = computed(() => {
    const cats = new Set(currentItems.value.map(item => item.category));
    return ['Todos', ...Array.from(cats)].sort();
});

const filteredItems = computed(() => {
    if (activeCategory.value === 'Todos') return currentItems.value;
    return currentItems.value.filter(item => item.category === activeCategory.value);
});

const getCategoryCount = (cat: string) => {
    if (cat === 'Todos') return currentItems.value.length;
    return currentItems.value.filter(item => item.category === cat).length;
};

const setTab = (tab: 'pages' | 'components' | 'funnels') => {
    activeTab.value = tab;
    activeCategory.value = 'Todos';
    animateStagger();
};

const setCategory = (cat: string) => {
    activeCategory.value = cat;
    animateStagger();
};

const openPreview = (item: Item) => {
    selectedItem.value = item;
    isModalOpen.value = true;
    previewWidth.value = 'desktop';
    document.body.style.overflow = 'hidden';
};

const closePreview = () => {
    isModalOpen.value = false;
    setTimeout(() => {
        selectedItem.value = null;
        document.body.style.overflow = '';
    }, 300);
};

const setPreviewWidth = (width: 'desktop' | 'tablet' | 'mobile') => {
    previewWidth.value = width;
};

// Fechar com ESC
if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen.value) closePreview();
    });
}

const animateStagger = () => {
    requestAnimationFrame(() => {
        animate(
            ".feed-item",
            { opacity: [0, 1], y: [20, 0], scale: [0.98, 1] } as any,
            {
                duration: 0.5,
                delay: stagger(0.05),
                ease: [0.23, 1, 0.32, 1]
            }
        );
    });
};

const hasSlot = (name: string) => {
    return !!slots[name];
};

const tabLabels = {
    pages: 'Páginas',
    components: 'Componentes',
    funnels: 'Funis'
};
</script>

<template>
    <div class="flex flex-col min-h-screen gap-8 relative transition-colors duration-500">

        <!-- Top Navigation com Toggle Integrado -->
        <div class="flex justify-center w-full mb-4 sticky top-2 z-50 pointer-events-none">
            <div class="flex items-center gap-3 p-1.5 rounded-2xl border backdrop-blur-2xl shadow-2xl pointer-events-auto max-w-2xl w-full transition-all duration-500"
                :class="isDark
                    ? 'bg-zinc-900/80 border-white/10 shadow-purple-500/10'
                    : 'bg-white/90 border-gray-200 shadow-gray-300/20'">

                <!-- Tabs -->
                <div class="flex gap-1 flex-1">
                    <button v-for="tab in (['pages', 'components', 'funnels'] as const)" :key="tab" @click="setTab(tab)"
                        class="flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500 relative overflow-hidden cursor-pointer"
                        :class="activeTab === tab
                            ? (isDark ? 'text-black' : 'text-white')
                            : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700')">
                        <div v-if="activeTab === tab" class="absolute inset-0 transition-colors duration-500"
                            :class="isDark ? 'bg-white' : 'bg-black'"></div>
                        <span class="relative z-10">{{ tabLabels[tab] }}</span>
                    </button>
                </div>

                <!-- Separador -->
                <div class="w-px h-10 transition-colors duration-300" :class="isDark ? 'bg-white/10' : 'bg-gray-300'">
                </div>

                <!-- Toggle Button -->
                <button @click="toggleTheme"
                    class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
                    :class="isDark
                        ? 'text-yellow-400 hover:bg-white/5'
                        : 'text-orange-500 hover:bg-gray-100'">
                    <!-- Ícone Sol (Light Mode) -->
                    <svg v-if="!isDark" class="size-5 transition-transform duration-500" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="4" />
                        <path
                            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                    <!-- Ícone Lua (Dark Mode) -->
                    <svg v-else class="size-5 transition-transform duration-500" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>

                    <!-- Texto (oculto em mobile) -->
                    <span class="hidden sm:inline">
                        {{ isDark ? 'Dark' : 'Light' }}
                    </span>
                </button>
            </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-8 relative">
            <!-- Sidebar -->
            <aside
                class="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 h-auto lg:h-[calc(100vh-6rem)] overflow-y-auto pr-4 no-scrollbar z-30">
                <h3 class="text-[10px] font-mono uppercase tracking-[0.3em] mb-6 px-2 transition-colors duration-500"
                    :class="isDark ? 'text-zinc-600' : 'text-gray-400'">Navegação</h3>
                <nav class="space-y-1">
                    <button v-for="cat in categories" :key="cat" @click="setCategory(cat)"
                        class="w-full group flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-300 border cursor-pointer"
                        :class="activeCategory === cat
                            ? (isDark
                                ? 'bg-white/5 text-white border-white/5 shadow-inner'
                                : 'bg-violet-50 text-violet-900 border-violet-200 shadow-sm')
                            : (isDark
                                ? 'text-zinc-500 hover:bg-zinc-900 hover:text-white border-transparent'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent')">
                        <span class="font-bold tracking-tight">{{ cat }}</span>
                        <span
                            class="text-[9px] font-black px-2 py-0.5 rounded-md border min-w-[28px] text-center transition-colors duration-300"
                            :class="activeCategory === cat
                                ? (isDark
                                    ? 'text-violet-400 border-violet-500/30 bg-zinc-950'
                                    : 'text-violet-700 border-violet-300 bg-violet-100')
                                : (isDark
                                    ? 'text-zinc-700 group-hover:text-zinc-400 bg-zinc-950 border-white/5'
                                    : 'text-gray-500 group-hover:text-gray-700 bg-gray-100 border-gray-200')">
                            {{ getCategoryCount(cat) }}
                        </span>
                    </button>
                </nav>
            </aside>

            <!-- Main -->
            <main class="flex-1 min-w-0 pb-24">
                <div class="mb-10 flex items-center justify-between">
                    <h2 class="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 transition-colors duration-500"
                        :class="isDark ? 'text-white' : 'text-gray-900'">
                        <span :class="isDark ? 'text-violet-500' : 'text-violet-600'">#</span>{{ activeCategory }}
                        <span
                            class="text-xl font-medium tracking-normal lowercase italic transition-colors duration-500"
                            :class="isDark ? 'text-zinc-800' : 'text-gray-400'">{{
                                tabLabels[activeTab] }}</span>
                    </h2>
                </div>

                <transition-group name="feed" tag="div"
                    class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-[340px]">
                    <div v-for="(item, index) in filteredItems" :key="item.id" @click="openPreview(item)"
                        class="feed-item group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border transition-all duration-700 cursor-pointer"
                        :class="[
                            { 'xl:col-span-2': (index % 5 === 0 || index % 5 === 3) && activeCategory === 'Todos' },
                            isDark
                                ? 'bg-[#09090b] border-white/5 hover:border-violet-500/30 hover:shadow-[0_0_50px_rgba(139,92,246,0.1)]'
                                : 'bg-white border-gray-200 hover:border-violet-400 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)]'
                        ]">

                        <!-- Image/Preview -->
                        <div class="relative flex-1 flex items-center justify-center overflow-hidden group transition-colors duration-500"
                            :class="isDark ? 'bg-zinc-900/10' : 'bg-gray-50'">
                            <div v-if="activeTab === 'components'"
                                class="w-full h-full flex items-center justify-center z-10 overflow-hidden relative pointer-events-none">
                                <div class="absolute inset-0" :class="isDark ? 'opacity-[0.03]' : 'opacity-[0.05]'"
                                    style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 20px 20px;">
                                </div>
                                <div
                                    class="w-[200%] h-[200%] transform origin-center scale-[0.45] opacity-90 transition-transform duration-700 group-hover:scale-[0.48]">
                                    <iframe :src="item.path" class="w-full h-full border-0 bg-transparent"
                                        loading="lazy"></iframe>
                                </div>
                            </div>
                            <div v-else
                                class="w-full h-full flex flex-col items-center justify-center border overflow-hidden relative transition-colors duration-500"
                                :class="isDark
                                    ? 'bg-zinc-950 border-zinc-900 group-hover:border-zinc-700'
                                    : 'bg-gray-100 border-gray-200 group-hover:border-gray-300'">
                                <div v-if="activeTab === 'funnels' && item.stepsCount"
                                    class="absolute top-4 right-4 z-30 px-2 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-tighter transition-colors"
                                    :class="isDark ? 'bg-violet-600' : 'bg-black'">
                                    {{ item.stepsCount }} ETAPAS
                                </div>
                                <div class="absolute -right-8 -bottom-8 transition-opacity transform rotate-12 scale-150 w-40 h-40"
                                    :class="isDark ? 'opacity-5 group-hover:opacity-10' : 'opacity-10 group-hover:opacity-20'"
                                    v-html="item.icon"></div>
                                <div class="relative z-10 flex flex-col items-center text-center p-8">
                                    <div class="w-16 h-16 mb-6 transform group-hover:scale-110 duration-500 transition-colors"
                                        :class="isDark ? 'text-zinc-500 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-700'"
                                        v-html="item.icon"></div>
                                    <div class="mt-4 px-3 py-1 border rounded-full text-[10px] font-mono uppercase tracking-widest transition-colors duration-300"
                                        :class="isDark
                                            ? 'bg-white/5 border-white/10 text-zinc-500 group-hover:bg-white/10 group-hover:text-zinc-300'
                                            : 'bg-gray-50 border-gray-300 text-gray-600 group-hover:bg-violet-50 group-hover:text-violet-700 group-hover:border-violet-300'">
                                        {{ activeTab === 'funnels' ? 'Explorar Funil' : 'Ver Template' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Info Bar -->
                        <div class="relative z-20 h-[80px] p-5 flex items-center justify-between border-t transition-colors duration-500"
                            :class="isDark
                                ? 'border-white/5 bg-[#0a0a0a] hover:bg-zinc-900/50'
                                : 'border-gray-200 bg-gray-50 hover:bg-white'">
                            <div class="flex items-center gap-3">
                                <div class="size-8 rounded-full flex items-center justify-center border transition-colors duration-300"
                                    :class="isDark
                                        ? 'border-white/10 bg-zinc-900 text-zinc-400'
                                        : 'border-gray-300 bg-white text-gray-600'" v-html="item.icon"></div>
                                <div>
                                    <h3 class="text-sm font-bold transition-colors line-clamp-1" :class="isDark
                                        ? 'text-gray-200 group-hover:text-white'
                                        : 'text-gray-700 group-hover:text-gray-900'">
                                        {{ item.name }}</h3>
                                    <p class="text-[10px] font-mono uppercase tracking-wide leading-tight mb-1 transition-colors duration-300"
                                        :class="isDark ? 'text-zinc-500' : 'text-gray-500'">
                                        {{ item.category }}</p>
                                    <p v-if="activeTab === 'components'"
                                        class="text-[10px] line-clamp-2 leading-tight transition-colors duration-300"
                                        :class="isDark
                                            ? 'text-zinc-600 group-hover:text-zinc-400'
                                            : 'text-gray-500 group-hover:text-gray-700'">
                                        {{ item.description }}
                                    </p>
                                </div>
                            </div>
                            <div class="size-8 rounded-full flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                                :class="isDark ? 'bg-white text-black' : 'bg-black text-white'">
                                <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M5 12h14m-7-7 7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </transition-group>

                <div v-if="filteredItems.length === 0"
                    class="flex flex-col items-center justify-center h-64 border border-dashed rounded-3xl transition-colors duration-500"
                    :class="isDark ? 'border-zinc-800' : 'border-gray-300'">
                    <p class="font-mono text-sm transition-colors duration-300"
                        :class="isDark ? 'text-zinc-500' : 'text-gray-500'">Nenhum item encontrado</p>
                    <button @click="setCategory('Todos')"
                        class="mt-2 text-xs uppercase tracking-widest transition-colors duration-300"
                        :class="isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-violet-600 hover:text-violet-700'">Limpar
                        Filtro</button>
                </div>
            </main>
        </div>

        <!-- Preview Modal -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="isModalOpen && selectedItem"
                    class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div class="absolute inset-0 backdrop-blur-xl transition-colors duration-500"
                        :class="isDark ? 'bg-black/90' : 'bg-gray-900/80'" @click="closePreview"></div>
                    <div class="relative w-full max-w-7xl h-full rounded-4xl border shadow-3xl overflow-hidden flex flex-col transition-colors duration-500"
                        :class="isDark
                            ? 'bg-[#09090b] border-white/10'
                            : 'bg-white border-gray-300'">
                        <!-- Header -->
                        <div class="flex items-center justify-between p-6 border-b transition-colors duration-500"
                            :class="isDark
                                ? 'border-white/5 bg-zinc-900/50'
                                : 'border-gray-200 bg-gray-50'">
                            <div class="flex items-center gap-4">
                                <div class="size-10 rounded-xl flex items-center justify-center border transition-colors duration-300"
                                    :class="isDark
                                        ? 'border-white/10 bg-black text-zinc-400'
                                        : 'border-gray-300 bg-white text-gray-600'" v-html="selectedItem.icon"></div>
                                <div>
                                    <h2 class="text-2xl font-black tracking-tighter transition-colors duration-300"
                                        :class="isDark ? 'text-white' : 'text-gray-900'">{{ selectedItem.name }}
                                    </h2>
                                    <p class="text-[10px] font-mono uppercase tracking-[0.2em] mb-2 transition-colors duration-300"
                                        :class="isDark ? 'text-zinc-500' : 'text-gray-500'">{{
                                            selectedItem.category }}</p>
                                    <p class="text-sm md:text-base max-w-2xl leading-relaxed italic transition-colors duration-300"
                                        :class="isDark ? 'text-zinc-400' : 'text-gray-600'">
                                        {{ selectedItem.description }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <a :href="selectedItem.path" target="_blank"
                                    class="px-6 py-2.5 rounded-full text-sm font-bold transition-colors flex items-center gap-2"
                                    :class="isDark
                                        ? 'bg-white text-black hover:bg-zinc-200'
                                        : 'bg-black text-white hover:bg-gray-800'">
                                    Acessar Template
                                    <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2.5">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" x2="21" y1="14" y2="3" />
                                    </svg>
                                </a>
                                <button @click="closePreview"
                                    class="size-10 rounded-full border flex items-center justify-center transition-all duration-300"
                                    :class="isDark
                                        ? 'border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white'
                                        : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900'">
                                    <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M18 6 6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <!-- Content Area -->
                        <div class="flex-1 overflow-hidden flex flex-col lg:flex-row relative transition-colors duration-500"
                            :class="isDark ? 'bg-zinc-950' : 'bg-gray-100'">
                            <!-- Funnel Steps -->
                            <div v-if="activeTab === 'funnels' && selectedItem.steps"
                                class="w-full lg:w-80 border-r p-6 overflow-y-auto no-scrollbar z-20 transition-colors duration-500"
                                :class="isDark
                                    ? 'bg-[#0c0c0e] border-white/5'
                                    : 'bg-white border-gray-200'">
                                <h3 class="text-xs font-mono uppercase tracking-[0.2em] mb-8 px-2 transition-colors duration-300"
                                    :class="isDark ? 'text-zinc-500' : 'text-gray-500'">Fluxo
                                    do Funil</h3>
                                <div class="space-y-4">
                                    <div v-for="(step, i) in selectedItem.steps" :key="i"
                                        @click="selectedItem.path = step.path"
                                        class="group/step relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer"
                                        :class="isDark
                                            ? 'border-white/5 bg-zinc-900/30 hover:bg-zinc-800/50'
                                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'">
                                        <div class="flex items-center gap-4">
                                            <div class="size-8 rounded-lg border flex items-center justify-center text-xs font-black transition-colors duration-300"
                                                :class="isDark
                                                    ? 'bg-zinc-950 border-white/10 text-zinc-500 group-hover/step:text-violet-400'
                                                    : 'bg-white border-gray-300 text-gray-500 group-hover/step:text-violet-600'">
                                                0{{ i + 1 }}</div>
                                            <div class="flex-1">
                                                <p class="text-sm font-bold transition-colors duration-300" :class="isDark
                                                    ? 'text-zinc-200 group-hover/step:text-white'
                                                    : 'text-gray-700 group-hover/step:text-gray-900'">
                                                    {{ step.name }}</p>
                                                <p class="text-[10px] font-mono uppercase tracking-wider mt-1 transition-colors duration-300"
                                                    :class="isDark ? 'text-zinc-600' : 'text-gray-500'">
                                                    Etapa de Conversão</p>
                                            </div>
                                            <div v-if="selectedItem.path === step.path"
                                                class="size-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Preview -->
                            <div class="flex-1 relative group/canvas flex items-center justify-center overflow-hidden">
                                <div class="h-full w-full transition-all duration-500 shadow-2xl"
                                    :style="previewStyles">
                                    <iframe :src="selectedItem.path" class="w-full h-full border-0 bg-white"
                                        loading="eager" :key="selectedItem.path"></iframe>
                                </div>

                                <!-- Toggles -->
                                <div class="absolute bottom-10 left-1/2 -translate-x-1/2 px-2 py-2 backdrop-blur-xl border rounded-2xl flex items-center opacity-0 group-hover/canvas:opacity-100 transition-all duration-500"
                                    :class="isDark
                                        ? 'bg-zinc-900/90 border-white/10'
                                        : 'bg-white/90 border-gray-300'">
                                    <button v-for="w in (['desktop', 'tablet', 'mobile'] as const)" :key="w"
                                        @click="setPreviewWidth(w)" class="p-2.5 rounded-xl transition-all"
                                        :class="previewWidth === w
                                            ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                                            : (isDark ? 'text-zinc-500 hover:text-white' : 'text-gray-500 hover:text-gray-900')">
                                        <template v-if="w === 'desktop'"><svg class="size-5" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" stroke-width="2">
                                                <rect width="20" height="14" x="2" y="3" rx="2" />
                                                <line x1="8" x2="16" y1="21" y2="21" />
                                                <line x1="12" x2="12" y1="17" y2="21" />
                                            </svg></template>
                                        <template v-else-if="w === 'tablet'"><svg class="size-5" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" stroke-width="2">
                                                <rect width="12" height="18" x="6" y="3" rx="2" />
                                                <line x1="8" x2="16" y1="21" y2="21" />
                                            </svg></template>
                                        <template v-else><svg class="size-5" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2">
                                                <rect width="14" height="20" x="5" y="2" rx="2" />
                                                <path d="M12 18h.01" />
                                            </svg></template>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
}
</style>
