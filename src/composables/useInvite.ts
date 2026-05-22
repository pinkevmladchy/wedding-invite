import { ref } from 'vue';

export function useInvite() {
    // TODO: замінити на справжні імена та коди гостей
    const GUEST_LIST: Record<string, { name: string }> = {
        'GUEST01': { name: "Ім'я Гостя 1" },
        'GUEST02': { name: "Ім'я Гостя 2" },
        'GUEST03': { name: "Ім'я Гостя 3" },
        'GUEST04': { name: "Ім'я Гостя 4" },
    };

    const screen = ref<'code' | 'reveal' | 'invite'>('code');
    const codeInput = ref('');
    const errorMsg = ref('');
    const inputShaking = ref(false);
    const guestName = ref('');
    const guestCode = ref('');
    const petals = ref<Array<{ id: number; left: number; duration: number; delay: number; rotation: number; symbol: string }>>([]);

    function checkCode() {
        const val = codeInput.value.trim().toUpperCase();
        if (!val) {
            errorMsg.value = 'Будь ласка, введіть код запрошення';
            return;
        }
        const guest = GUEST_LIST[val];
        if (!guest) {
            errorMsg.value = 'Невірний код. Перевірте, будь ласка, ще раз';
            inputShaking.value = true;
            setTimeout(() => { inputShaking.value = false; }, 500);
            return;
        }

        errorMsg.value = '';
        guestName.value = guest.name;
        guestCode.value = val;
        startReveal();
    }

    function startReveal() {
        screen.value = 'reveal';
        startPetals();
        setTimeout(() => {
            screen.value = 'invite';
            startPetals();
        }, 3800);
    }

    function startPetals() {
        const symbols = ['❀', '❁', '✿', '❃', '✤'];
        petals.value = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            duration: 10 + Math.random() * 8,
            delay: Math.random() * 6,
            rotation: Math.random() * 360,
            symbol: symbols[Math.floor(Math.random() * symbols.length)]!,
        }));
    }

    startPetals();

    return { screen, codeInput, errorMsg, checkCode, inputShaking, guestName, guestCode, petals };
}
