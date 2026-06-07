import { ref } from 'vue';

export function useInvite() {
    // Код запрошення → ім'я гостя (код вводиться без урахування регістру)
    const GUEST_LIST: Record<string, { name: string }> = {
        'BATKYDIMA':   { name: "Батьки Дмитра" },
        'BATKYIRY':    { name: "Батьки Ірини" },
        'MITYADASHA':  { name: "Мітя та Даша" },
        'KATYASONYA':  { name: "Катя та Соня" },
        'KIRILNASTYA': { name: "Кіріл та Настя" },
        'ARTEMLENA':   { name: "Артем та Лена" },
        'VLADOSLERA':  { name: "Владос та Лера" },
        'DASHA':       { name: "Даша Булава" },
        'MYKULIN':     { name: "Влад Микулін" },
        'VETAL':       { name: "Веталь Бессараб" },
        'VITYA':       { name: "Вітя Ейсмонт" },
        'NIZARANYA':   { name: "Нізар та Аня" },
        'DIMALENA':    { name: "Діма та Лена" },
        'VLADA':       { name: "Влада Сєрікова" },
        'SASHAYULYA':  { name: "Саша та Юля" },
        'NASTYA':      { name: "Настя Кулініч" },
    };

    const screen = ref<'code' | 'reveal' | 'invite' | 'admin'>('code');
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
        if (val === 'ADMIN') {
            errorMsg.value = '';
            screen.value = 'admin';
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
        }, 1600);
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
