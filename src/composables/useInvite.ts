import { ref } from 'vue';

export function useInvite() {
    // Код запрошення → ім'я гостя (код вводиться без урахування регістру)
    // kids: true — гостю показується секція про дитячу зону
    // greet: 'm' | 'f' — рід для вітання (Любий/Люба); без поля → множина (Любі)
    // task — персональне прохання, показується окремою карткою лише цьому гостю
    const GUEST_LIST: Record<string, { name: string; kids?: boolean; greet?: 'm' | 'f'; task?: string }> = {
        'BATKYDIMA':   { name: "Батьки нареченого" },
        'BATKYIRY':    { name: "Батьки нареченої" },
        'MITYADASHA':  { name: "Мітя та Даша", kids: true,
                         task: "Ми будемо дуже раді, якщо Ілюша винесе обручки для наречених під час церемонії." },
        'KATYASONYA':  { name: "Катя та Соня", kids: true,
                         task: "Ми будемо дуже раді, якщо Соня винесе обручки для наречених під час церемонії." },
        'KIRILNASTYA': { name: "Кіріл та Настя" },
        'ARTEMLENA':   { name: "Артем та Олена", kids: true },
        'VLADOSLERA':  { name: "Владос та Валерія" },
        'DASHA':       { name: "Даша Булава", greet: 'f' },
        'MYKULIN':     { name: "Влад Микулін", greet: 'm' },
        'VETAL':       { name: "Веталь Бессараб", greet: 'm' },
        'VITYA':       { name: "Вітя Ейсмонт", greet: 'm' },
        'NIZARANYA':   { name: "Нізар та Аня" },
        'DIMALENA':    { name: "Діма та Олена" },
        'VLADA':       { name: "Влада Сєрікова", greet: 'f' },
        'SASHAYULYA':  { name: "Саша та Юля" },
        'NASTYA':      { name: "Настя Кулініч", greet: 'f' },
        'DENYS':       { name: "Денис Тищенко", greet: 'm' },
    };

    const screen = ref<'code' | 'reveal' | 'invite' | 'admin'>('code');
    const codeInput = ref('');
    const errorMsg = ref('');
    const inputShaking = ref(false);
    const guestName = ref('');
    const guestCode = ref('');
    const guestKids = ref(false);
    const guestGreeting = ref('Любі');
    const guestTask = ref('');
    const petals = ref<Array<{ id: number; left: number; duration: number; delay: number; rotation: number; symbol: string }>>([]);

    function checkCode() {
        const val = codeInput.value.trim().toUpperCase();
        if (!val) {
            errorMsg.value = 'Будь ласка, введіть код запрошення';
            return;
        }
        // Код адміна (вводиться без урахування регістру)
        if (val === 'IRADIMA2308QZ') {
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
        guestKids.value = !!guest.kids;
        guestGreeting.value = guest.greet === 'm' ? 'Любий' : guest.greet === 'f' ? 'Люба' : 'Любі';
        guestTask.value = guest.task ?? '';
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

    return { screen, codeInput, errorMsg, checkCode, inputShaking, guestName, guestCode, guestKids, guestGreeting, guestTask, petals };
}
