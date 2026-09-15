// Расписание группы ИДБ-23-01
// slot — индекс временного слота (0..7), см. TIMES в script.js
const GROUP_NAME = "ИДБ-23-01";

const TIMES = [
  "8:30 – 10:05",
  "10:15 – 11:50",
  "12:20 – 13:55",
  "14:05 – 15:40",
  "15:50 – 17:25",
  "18:00 – 19:30",
  "19:40 – 21:10",
  "21:20 – 22:50",
];

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

// type: "Лекция" | "Семинар" | "Лабораторная"
// subgroup: "А" | "Б" | null
// weeks: "every" (каждую неделю) | "alt" (через неделю)
const SCHEDULE = [
  // ПОНЕДЕЛЬНИК
  { day: 0, slot: 3, subject: "Системы искусственного интеллекта", teacher: "Стоякова К.Л.", type: "Лекция", subgroup: null, room: "0206", weeks: "every", dates: "07.09 – 23.11" },
  { day: 0, slot: 4, subject: "Системы искусственного интеллекта", teacher: "Стоякова К.Л.", type: "Лабораторная", subgroup: "А", room: "240(а)", weeks: "alt", dates: "19.10 – 16.11" },
  { day: 0, slot: 4, subject: "Системы искусственного интеллекта", teacher: "Стоякова К.Л.", type: "Лабораторная", subgroup: "Б", room: "240(а)", weeks: "alt", dates: "26.10 – 23.11" },
  { day: 0, slot: 4, subject: "Системы искусственного интеллекта", teacher: "Стоякова К.Л.", type: "Семинар", subgroup: null, room: "0402", weeks: "every", dates: "07.09 – 12.10" },

  // ВТОРНИК
  { day: 1, slot: 0, subject: "Основы новых информационных технологий", teacher: "Бибиков О.Д.", type: "Лекция", subgroup: null, room: "—", weeks: "every", dates: "01.09 – 01.12" },
  { day: 1, slot: 1, subject: "Сети и телекоммуникации", teacher: "Сосенушкин С.Е.", type: "Лекция", subgroup: null, room: "—", weeks: "every", dates: "15.09 – 17.11" },
  { day: 1, slot: 2, subject: "Стратегии развития ИТ бизнеса", teacher: "Александров С.А.", type: "Лекция", subgroup: null, room: "—", weeks: "every", dates: "29.09 – 01.12" },

  // СРЕДА
  { day: 2, slot: 1, subject: "Сети и телекоммуникации", teacher: "Казовский М.Д.", type: "Семинар", subgroup: null, room: "—", weeks: "every", dates: "16.09 – 07.10" },
  { day: 2, slot: 2, subject: "Стандартизация и нормативное регулирование цифровых систем", teacher: "Сигачева М.А.", type: "Семинар", subgroup: null, room: "—", weeks: "every", dates: "09.09 – 28.10" },
  { day: 2, slot: 3, subject: "Защита информации", teacher: "Симонов М.Ф.", type: "Лекция", subgroup: null, room: "—", weeks: "every", dates: "02.09 – 28.10, 11.11 – 09.12" },
  { day: 2, slot: 4, subject: "Основы новых информационных технологий", teacher: "Ахунов Т.Е.", type: "Семинар", subgroup: null, room: "—", weeks: "every", dates: "09.09 – 28.10, 11.11, 18.11" },
  { day: 2, slot: 5, subject: "Стратегии развития ИТ бизнеса", teacher: "Александров С.А.", type: "Семинар", subgroup: null, room: "—", weeks: "every", dates: "14.10 – 28.10, 11.11 – 25.11" },

  // ЧЕТВЕРГ
  { day: 3, slot: 3, subject: "Стандартизация и нормативное регулирование цифровых систем", teacher: "Бабенко Е.В.", type: "Лекция", subgroup: null, room: "—", weeks: "every", dates: "03.09 – 17.12" },
  { day: 3, slot: 4, subject: "Защита информации", teacher: "Симонов М.Ф.", type: "Лабораторная", subgroup: "А", room: "—", weeks: "alt", dates: "17.09 – 12.11" },
  { day: 3, slot: 4, subject: "Защита информации", teacher: "Симонов М.Ф.", type: "Лабораторная", subgroup: "Б", room: "—", weeks: "alt", dates: "24.09 – 19.11" },
  { day: 3, slot: 4, subject: "Стратегии развития ИТ бизнеса", teacher: "Тагаев А.И.", type: "Лабораторная", subgroup: "А", room: "—", weeks: "alt", dates: "22.10 – 03.12" },
  { day: 3, slot: 4, subject: "Стратегии развития ИТ бизнеса", teacher: "Тагаев А.И.", type: "Лабораторная", subgroup: "Б", room: "—", weeks: "alt", dates: "29.10 – 10.12" },

  // ПЯТНИЦА
  { day: 4, slot: 0, subject: "Основы новых информационных технологий", teacher: "Ахунов Т.Е.", type: "Лабораторная", subgroup: "А", room: "240(а)", weeks: "alt", dates: "18.09 – 30.10" },
  { day: 4, slot: 0, subject: "Основы новых информационных технологий", teacher: "Ахунов Т.Е.", type: "Лабораторная", subgroup: "Б", room: "240(а)", weeks: "alt", dates: "25.09 – 06.11" },
  { day: 4, slot: 0, subject: "Сети и телекоммуникации", teacher: "Казовский М.Д.", type: "Лабораторная", subgroup: "Б", room: "247", weeks: "alt", dates: "16.10 – 11.12" },
  { day: 4, slot: 0, subject: "Сети и телекоммуникации", teacher: "Казовский М.Д.", type: "Лабораторная", subgroup: "А", room: "247", weeks: "alt", dates: "23.10 – 18.12" },

  // СУББОТА
  { day: 5, slot: 0, subject: "Операционные системы", teacher: "Пушкин А.Ю.", type: "Лекция", subgroup: null, room: "0411", weeks: "every", dates: "05.09 – 26.09, 24.10 – 14.11" },
  { day: 5, slot: 1, subject: "Современные технологии и средства разработки ПО", teacher: "Гаврилов А.Г.", type: "Лекция", subgroup: null, room: "0411", weeks: "every", dates: "19.09 – 19.12" },
  { day: 5, slot: 2, subject: "Современные технологии и средства разработки ПО", teacher: "Гаврилов А.Г.", type: "Лабораторная", subgroup: "А", room: "240(а)", weeks: "alt", dates: "31.10 – 12.12" },
  { day: 5, slot: 2, subject: "Современные технологии и средства разработки ПО", teacher: "Гаврилов А.Г.", type: "Лабораторная", subgroup: "Б", room: "240(а)", weeks: "alt", dates: "07.11 – 19.12" },
  { day: 5, slot: 2, subject: "Современные технологии и средства разработки ПО", teacher: "Гаврилов А.Г.", type: "Семинар", subgroup: null, room: "310", weeks: "every", dates: "19.09 – 24.10" },
  { day: 5, slot: 4, subject: "Операционные системы", teacher: "Пушкин А.Ю.", type: "Лабораторная", subgroup: "Б", room: "—", weeks: "alt", dates: "31.10 – 12.12" },
  { day: 5, slot: 4, subject: "Операционные системы", teacher: "Пушкин А.Ю.", type: "Лабораторная", subgroup: "А", room: "—", weeks: "alt", dates: "07.11 – 19.12" },
];
