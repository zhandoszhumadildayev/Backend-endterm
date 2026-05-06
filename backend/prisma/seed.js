const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function lessonId(n) {
  return `30000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
}

function exerciseId(lessonNo, taskNo) {
  return `50000000-${String(lessonNo).padStart(4, '0')}-4000-8000-${String(taskNo).padStart(12, '0')}`;
}

async function main() {
  const adminPassword = await bcrypt.hash('Admin12345!', 12);
  const parentPassword = await bcrypt.hash('Parent12345!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@literacy.kz' },
    update: { name: 'Admin Content Manager', role: 'ADMIN' },
    create: {
      name: 'Admin Content Manager',
      email: 'admin@literacy.kz',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });

  const parent = await prisma.user.upsert({
    where: { email: 'parent@literacy.kz' },
    update: { name: 'Demo Parent', role: 'PARENT' },
    create: {
      name: 'Demo Parent',
      email: 'parent@literacy.kz',
      passwordHash: parentPassword,
      role: 'PARENT'
    }
  });

  const child = await prisma.child.upsert({
    where: { id: '11111111-1111-4111-8111-111111111111' },
    update: {
      parentId: parent.id,
      displayName: 'Аян',
      age: 7,
      learningLevel: 'Level 1'
    },
    create: {
      id: '11111111-1111-4111-8111-111111111111',
      parentId: parent.id,
      displayName: 'Аян',
      age: 7,
      avatarUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=Ayan',
      learningLevel: 'Level 1'
    }
  });

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

  const unit = await prisma.unit.upsert({
    where: { id: '22222222-2222-4222-8222-222222222222' },
    update: {
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
    },
    create: {
      id: '22222222-2222-4222-8222-222222222222',
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

  await prisma.exercise.deleteMany({
    where: {
      OR: [
        { lessonId: { startsWith: '30000000-0000-4000-8000-' } },
        { lessonId: { in: ['33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444'] } }
      ]
    }
  });

  await prisma.lesson.deleteMany({
    where: {
      OR: [
        { id: { startsWith: '30000000-0000-4000-8000-' } },
        { id: { in: ['33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444'] } }
      ]
    }
  });

  const lessons = [
    {
      title: 'Гласные буквы',
      instruction: 'Учимся находить гласные буквы: А, О, У, Ы, И, Э, Е, Ё, Ю, Я.',
      xp: 15,
      exercises: [
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
      exercises: [
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
      exercises: [
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
      exercises: [
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
      exercises: [
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
      exercises: [
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
      exercises: [
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
      exercises: [
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
      exercises: [
        ['HANDWRITING', 'Как правильно написать имя?', ['Аня', 'аня', 'АНЯ', 'аНя'], 'Аня'],
        ['HANDWRITING', 'Выбери правильное начало предложения.', ['Мама читает.', 'мама читает.', 'МАМА читает.'], 'Мама читает.'],
        ['HANDWRITING', 'Как правильно написать имя мальчика?', ['Дима', 'дима', 'ДИМА', 'диМа'], 'Дима'],
        ['SIGHT_WORDS', 'Что пишется с большой буквы?', ['имя человека', 'любой предлог', 'каждая буква', 'середина слова'], 'имя человека']
      ]
    },
    {
      title: 'Знаки в конце предложения',
      instruction: 'Ставим точку и вопросительный знак.',
      xp: 20,
      exercises: [
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
      exercises: [
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
      exercises: [
        ['VOCABULARY', 'Текст: «У Маши есть кот». У кого есть кот?', ['у Маши', 'у Пети', 'у мамы'], 'у Маши'],
        ['VOCABULARY', 'Текст: «Кот спит на ковре». Где спит кот?', ['на ковре', 'на столе', 'в лесу'], 'на ковре'],
        ['VOCABULARY', 'Текст: «Петя взял мяч». Что взял Петя?', ['мяч', 'книгу', 'яблоко', 'ручку'], 'мяч'],
        ['VOCABULARY', 'Текст: «Аня рисует дом». Что рисует Аня?', ['дом', 'котика', 'лес', 'солнце'], 'дом']
      ]
    },
    {
      title: 'Рифмы',
      instruction: 'Ищем слова, которые звучат похоже.',
      xp: 30,
      exercises: [
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
      exercises: [
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
      exercises: [
        ['PHONICS', 'Какая буква гласная?', ['И', 'Л', 'Н', 'Р'], 'И'],
        ['VOCABULARY', 'Выбери слово для 🐶', ['собака', 'кошка', 'дом', 'мяч'], 'собака'],
        ['SIGHT_WORDS', 'Какой знак нужен: «Ты дома»', ['?', '.', ','], '?'],
        ['HANDWRITING', 'Выбери правильное предложение.', ['Аня читает книгу.', 'аня читает книгу', 'Аня читает книгу'], 'Аня читает книгу.']
      ]
    }
  ];

  for (let i = 0; i < lessons.length; i += 1) {
    const item = lessons[i];

    const lesson = await prisma.lesson.upsert({
      where: { id: lessonId(i + 1) },
      update: {
        unitId: unit.id,
        title: { ru: item.title, en: item.title },
        instructions: { ru: item.instruction, en: item.instruction },
        orderNo: i + 1,
        xpReward: item.xp,
        difficulty: i < 10 ? 'EASY' : 'MEDIUM',
        published: true
      },
      create: {
        id: lessonId(i + 1),
        unitId: unit.id,
        title: { ru: item.title, en: item.title },
        instructions: { ru: item.instruction, en: item.instruction },
        orderNo: i + 1,
        xpReward: item.xp,
        difficulty: i < 10 ? 'EASY' : 'MEDIUM',
        published: true
      }
    });

    for (let j = 0; j < item.exercises.length; j += 1) {
      const [type, prompt, options, correctAnswer] = item.exercises[j];

      await prisma.exercise.upsert({
        where: { id: exerciseId(i + 1, j + 1) },
        update: {
          lessonId: lesson.id,
          type,
          prompt: { ru: prompt, en: prompt },
          options,
          correctAnswer,
          orderNo: j + 1,
          difficulty: i < 10 ? 'EASY' : 'MEDIUM'
        },
        create: {
          id: exerciseId(i + 1, j + 1),
          lessonId: lesson.id,
          type,
          prompt: { ru: prompt, en: prompt },
          options,
          correctAnswer,
          orderNo: j + 1,
          difficulty: i < 10 ? 'EASY' : 'MEDIUM'
        }
      });
    }
  }

  const welcomeExists = await prisma.notification.findFirst({
    where: { parentId: parent.id, childId: child.id, title: 'Добро пожаловать' }
  });

  if (!welcomeExists) {
    await prisma.notification.create({
      data: {
        parentId: parent.id,
        childId: child.id,
        type: 'WEEKLY_SUMMARY',
        title: 'Добро пожаловать',
        message: 'Аян готов начать модуль «Русский язык — 7–8 лет». В модуле 15 уроков и 60 заданий.'
      }
    });
  }

  console.log('Seed completed: 15 Russian lessons and 60 unique tasks added');
  console.log({
    admin: admin.email,
    parent: parent.email,
    child: child.displayName,
    lessons: lessons.length
  });
}

main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });