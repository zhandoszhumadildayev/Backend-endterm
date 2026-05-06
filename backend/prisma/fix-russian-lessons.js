const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const lessons = [
    {
        title: 'Гласные буквы',
        instruction: 'Учимся находить гласные буквы.',
        xp: 15,
        tasks: [
            ['PHONICS', 'Какая буква является гласной?', ['А', 'Б', 'К', 'Т'], 'А'],
            ['PHONICS', 'Выбери гласную букву.', ['О', 'М', 'С', 'Р'], 'О'],
            ['VOCABULARY', 'В каком слове есть буква У?', ['лук', 'дом', 'лес', 'сыр'], 'лук'],
            ['SIGHT_WORDS', 'Сколько гласных в слове «мама»?', ['2', '1', '3', '0'], '2']
        ]
    },
    {
        title: 'Согласные буквы',
        instruction: 'Отличаем согласные буквы от гласных.',
        xp: 15,
        tasks: [
            ['PHONICS', 'Какая буква является согласной?', ['М', 'А', 'О', 'У'], 'М'],
            ['PHONICS', 'Выбери согласную букву.', ['К', 'И', 'Е', 'Я'], 'К'],
            ['VOCABULARY', 'Какое слово начинается на букву С?', ['сок', 'мир', 'кот', 'дом'], 'сок'],
            ['SIGHT_WORDS', 'Сколько согласных в слове «кот»?', ['2', '1', '3', '0'], '2']
        ]
    },
    {
        title: 'Слоги МА, МО, МУ',
        instruction: 'Собираем простые слоги из букв.',
        xp: 20,
        tasks: [
            ['SIGHT_WORDS', 'М + А = ?', ['ма', 'мо', 'му', 'мы'], 'ма'],
            ['SIGHT_WORDS', 'М + О = ?', ['мо', 'ма', 'му', 'ми'], 'мо'],
            ['SIGHT_WORDS', 'М + У = ?', ['му', 'ма', 'мо', 'ме'], 'му'],
            ['VOCABULARY', 'Какой слог есть в слове «мама»?', ['ма', 'ко', 'су', 'ры'], 'ма']
        ]
    },
    {
        title: 'Слоги ПА, ПО, ПУ',
        instruction: 'Читаем слоги с буквой П.',
        xp: 20,
        tasks: [
            ['SIGHT_WORDS', 'П + А = ?', ['па', 'по', 'пу', 'пи'], 'па'],
            ['SIGHT_WORDS', 'П + О = ?', ['по', 'па', 'пу', 'пы'], 'по'],
            ['SIGHT_WORDS', 'П + У = ?', ['пу', 'па', 'по', 'пе'], 'пу'],
            ['VOCABULARY', 'Какое слово начинается со слога «па»?', ['папа', 'мама', 'дом', 'кот'], 'папа']
        ]
    },
    {
        title: 'Собираем слова',
        instruction: 'Соединяем слоги в слова.',
        xp: 20,
        tasks: [
            ['VOCABULARY', 'ма + ма = ?', ['мама', 'мир', 'рама', 'мыло'], 'мама'],
            ['VOCABULARY', 'па + па = ?', ['папа', 'пила', 'пол', 'парк'], 'папа'],
            ['VOCABULARY', 'ко + тик = ?', ['котик', 'домик', 'носик', 'листик'], 'котик'],
            ['SIGHT_WORDS', 'Выбери слово из двух слогов.', ['мама', 'кот', 'дом', 'лес'], 'мама']
        ]
    },
    {
        title: 'Слова по картинке',
        instruction: 'Выбираем слово по смыслу и картинке.',
        xp: 20,
        tasks: [
            ['VOCABULARY', 'Выбери слово для 🐱', ['кот', 'дом', 'лес', 'нос'], 'кот'],
            ['VOCABULARY', 'Выбери слово для 🏠', ['дом', 'мак', 'мяч', 'кит'], 'дом'],
            ['VOCABULARY', 'Выбери слово для ☀️', ['солнце', 'дождь', 'снег', 'ночь'], 'солнце'],
            ['VOCABULARY', 'Выбери слово для 🍎', ['яблоко', 'книга', 'стол', 'река'], 'яблоко']
        ]
    },
    {
        title: 'Ударение',
        instruction: 'Учимся слышать ударный слог.',
        xp: 25,
        tasks: [
            ['PHONICS', 'В слове «молоко» ударение падает на...', ['последний слог', 'первый слог', 'второй слог'], 'последний слог'],
            ['PHONICS', 'В слове «мама» ударение падает на...', ['первый слог', 'второй слог', 'третий слог'], 'первый слог'],
            ['PHONICS', 'В слове «рука» ударение падает на...', ['второй слог', 'первый слог', 'третий слог'], 'второй слог'],
            ['PHONICS', 'Выбери слово с ударением на первом слоге.', ['кошка', 'молоко', 'рука', 'трава'], 'кошка']
        ]
    },
    {
        title: 'Мягкий знак',
        instruction: 'Понимаем, зачем нужен мягкий знак.',
        xp: 25,
        tasks: [
            ['SIGHT_WORDS', 'В каком слове есть мягкий знак?', ['конь', 'кот', 'дом', 'сад'], 'конь'],
            ['SIGHT_WORDS', 'Выбери слово с мягким знаком.', ['день', 'дуб', 'мак', 'сок'], 'день'],
            ['SIGHT_WORDS', 'Какое слово написано правильно?', ['пень', 'пен', 'пэн', 'пинь'], 'пень'],
            ['VOCABULARY', 'Мягкий знак делает звук...', ['мягким', 'громким', 'длинным', 'тихим'], 'мягким']
        ]
    },
    {
        title: 'Большая буква',
        instruction: 'Имена и начало предложения пишем с большой буквы.',
        xp: 20,
        tasks: [
            ['HANDWRITING', 'Как правильно написать имя?', ['Аня', 'аня', 'АНЯ', 'аНя'], 'Аня'],
            ['HANDWRITING', 'Выбери правильное начало предложения.', ['Мама читает.', 'мама читает.', 'МАМА читает.'], 'Мама читает.'],
            ['HANDWRITING', 'Как правильно написать имя мальчика?', ['Дима', 'дима', 'ДИМА', 'диМа'], 'Дима'],
            ['SIGHT_WORDS', 'Что пишется с большой буквы?', ['имя человека', 'любой предлог', 'каждая буква'], 'имя человека']
        ]
    },
    {
        title: 'Знаки в конце предложения',
        instruction: 'Ставим точку и вопросительный знак.',
        xp: 20,
        tasks: [
            ['SIGHT_WORDS', 'Какой знак нужен в конце: «Я читаю»', ['.', '?', ','], '.'],
            ['SIGHT_WORDS', 'Какой знак нужен: «Где мяч»', ['?', '.', ','], '?'],
            ['SIGHT_WORDS', 'Выбери правильное предложение.', ['Кот спит.', 'Кот спит', 'кот спит'], 'Кот спит.'],
            ['VOCABULARY', 'Какой знак ставим после вопроса?', ['?', '.', '!'], '?']
        ]
    },
    {
        title: 'Простые предложения',
        instruction: 'Читаем и понимаем короткие предложения.',
        xp: 25,
        tasks: [
            ['SIGHT_WORDS', 'Выбери правильное предложение.', ['Мама читает книгу.', 'мама читает книгу', 'Мама читает книгу'], 'Мама читает книгу.'],
            ['VOCABULARY', 'Кто читает в предложении «Мама читает»?', ['мама', 'кот', 'папа', 'Аня'], 'мама'],
            ['VOCABULARY', 'Что делает кот в предложении «Кот спит»?', ['спит', 'бежит', 'читает', 'пишет'], 'спит'],
            ['SIGHT_WORDS', 'Выбери предложение с точкой.', ['Я дома.', 'Я дома', 'я дома?', 'Я дома,'], 'Я дома.']
        ]
    },
    {
        title: 'Короткий текст',
        instruction: 'Читаем маленький текст и отвечаем на вопросы.',
        xp: 30,
        tasks: [
            ['VOCABULARY', 'Текст: «У Маши есть кот». У кого есть кот?', ['у Маши', 'у Пети', 'у мамы'], 'у Маши'],
            ['VOCABULARY', 'Текст: «Кот спит на ковре». Где спит кот?', ['на ковре', 'на столе', 'в лесу'], 'на ковре'],
            ['VOCABULARY', 'Текст: «Петя взял мяч». Что взял Петя?', ['мяч', 'книгу', 'яблоко'], 'мяч'],
            ['VOCABULARY', 'Текст: «Аня рисует дом». Что рисует Аня?', ['дом', 'котика', 'лес'], 'дом']
        ]
    },
    {
        title: 'Рифмы',
        instruction: 'Ищем слова, которые звучат похоже.',
        xp: 30,
        tasks: [
            ['PHONICS', 'Какая пара рифмуется?', ['кот — рот', 'дом — лес', 'мир — сон'], 'кот — рот'],
            ['PHONICS', 'Подбери рифму к слову «дом».', ['сом', 'кот', 'лес', 'лук'], 'сом'],
            ['PHONICS', 'Подбери рифму к слову «мак».', ['рак', 'дом', 'сыр', 'нос'], 'рак'],
            ['PHONICS', 'Какие слова звучат похоже?', ['мишка — книжка', 'кот — дом', 'лес — мама'], 'мишка — книжка']
        ]
    },
    {
        title: 'Мини-диктант',
        instruction: 'Выбираем правильно написанные слова.',
        xp: 35,
        tasks: [
            ['HANDWRITING', 'Какое слово написано правильно?', ['молоко', 'малако', 'молако', 'молокоо'], 'молоко'],
            ['HANDWRITING', 'Выбери правильное слово.', ['собака', 'сабака', 'собока', 'сбака'], 'собака'],
            ['HANDWRITING', 'Как правильно?', ['машина', 'мащина', 'машына', 'мошина'], 'машина'],
            ['HANDWRITING', 'Выбери слово без ошибки.', ['книга', 'кника', 'кнега', 'кинига'], 'книга']
        ]
    },
    {
        title: 'Повторение модуля',
        instruction: 'Финальное повторение всех тем.',
        xp: 40,
        tasks: [
            ['PHONICS', 'Какая буква гласная?', ['И', 'Л', 'Н', 'Р'], 'И'],
            ['VOCABULARY', 'Выбери слово для 🐶', ['собака', 'кошка', 'дом', 'мяч'], 'собака'],
            ['SIGHT_WORDS', 'Какой знак нужен: «Ты дома»', ['?', '.', ','], '?'],
            ['HANDWRITING', 'Выбери правильное предложение.', ['Аня читает книгу.', 'аня читает книгу', 'Аня читает книгу'], 'Аня читает книгу.']
        ]
    }
];

async function main() {
    const adminPassword = await bcrypt.hash('Admin12345!', 12);
    const parentPassword = await bcrypt.hash('Parent12345!', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@literacy.kz' },
        update: {
            name: 'Admin Content Manager',
            role: 'ADMIN'
        },
        create: {
            name: 'Admin Content Manager',
            email: 'admin@literacy.kz',
            passwordHash: adminPassword,
            role: 'ADMIN'
        }
    });

    const parent = await prisma.user.upsert({
        where: { email: 'parent@literacy.kz' },
        update: {
            name: 'Demo Parent',
            role: 'PARENT'
        },
        create: {
            name: 'Demo Parent',
            email: 'parent@literacy.kz',
            passwordHash: parentPassword,
            role: 'PARENT'
        }
    });

    await prisma.child.updateMany({
        data: {
            xp: 0,
            level: 1,
            learningLevel: 'Level 1',
            streak: 0,
            progressPercentage: 0,
            lastActiveDate: null
        }
    });

    await prisma.exerciseResult.deleteMany();
    await prisma.lessonProgress.deleteMany();
    await prisma.childBadge.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.unit.deleteMany();

    const badges = [
        ['FIRST_LESSON', 'Первый урок', 'Выдается после первого выполненного урока.'],
        ['SEVEN_DAY_STREAK', '7 дней подряд', 'Выдается за 7 активных дней подряд.'],
        ['HUNDRED_XP', '100 XP', 'Выдается после 100 XP.'],
        ['UNIT_COMPLETE', 'Модуль завершен', 'Выдается после завершения всех уроков модуля.']
    ];

    for (const [code, name, description] of badges) {
        await prisma.badge.upsert({
            where: { code },
            update: { name, description },
            create: { code, name, description }
        });
    }

    const unit = await prisma.unit.create({
        data: {
            title: {
                ru: 'Русский язык — 7–8 лет',
                en: 'Russian Language — age 7–8',
                kk: 'Орыс тілі — 7–8 жас'
            },
            description: {
                ru: 'Буквы, звуки, слоги, слова, предложения и короткие тексты.',
                en: 'Letters, sounds, syllables, words, sentences and short texts.',
                kk: 'Әріптер, дыбыстар, буындар, сөздер, сөйлемдер және қысқа мәтіндер.'
            },
            orderNo: 1,
            difficulty: 'EASY',
            published: true
        }
    });

    for (let i = 0; i < lessons.length; i += 1) {
        const lesson = lessons[i];

        await prisma.lesson.create({
            data: {
                unitId: unit.id,
                title: {
                    ru: lesson.title,
                    en: lesson.title,
                    kk: lesson.title
                },
                instructions: {
                    ru: lesson.instruction,
                    en: lesson.instruction,
                    kk: lesson.instruction
                },
                orderNo: i + 1,
                xpReward: lesson.xp,
                difficulty: i < 10 ? 'EASY' : 'MEDIUM',
                published: true,
                exercises: {
                    create: lesson.tasks.map((task, index) => ({
                        type: task[0],
                        prompt: {
                            ru: task[1],
                            en: task[1],
                            kk: task[1]
                        },
                        options: task[2],
                        correctAnswer: task[3],
                        orderNo: index + 1,
                        difficulty: i < 10 ? 'EASY' : 'MEDIUM'
                    }))
                }
            }
        });
    }

    await prisma.notification.create({
        data: {
            parentId: parent.id,
            type: 'WEEKLY_SUMMARY',
            title: 'Модуль обновлен',
            message: 'Добавлен модуль русского языка: 15 уроков и 60 заданий для ребенка 7–8 лет.'
        }
    });

    const lessonCount = await prisma.lesson.count();
    const exerciseCount = await prisma.exercise.count();

    console.log('DONE');
    console.log('Admin:', admin.email);
    console.log('Parent:', parent.email);
    console.log('Lessons:', lessonCount);
    console.log('Exercises:', exerciseCount);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });