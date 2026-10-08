// ===== Настройки — меняй здесь =====
window.CONFIG = {
  // Слова, которые собираются из частиц после отсчёта 3-2-1 (латиницей, коротко)
  words: ["HAPPY", "BIRTHDAY", "MY", "LOVE", "♥"],

  // Музыка: файл рядом с index.html (если файла нет — кнопка спрячется)
  music: "music.mp3",

  // Фото по порядку. Книга идёт разворотами по 2 фото:
  // [1,2] [3,4] [5,6] ... — подписи ниже идут к этим разворотам
  photos: [
    "photos/14.jpg", "photos/03.jpg",   // 1. красивые селфи — начало
    "photos/11.jpg", "photos/01.jpg",   // 2. глаз + маска
    "photos/02.jpg", "photos/04.jpg",   // 3. медвежонок
    "photos/08.jpg", "photos/13.jpg",   // 4. ещё медвежонок
    "photos/07.jpg", "photos/15.jpg",   // 5. смешные фильтры
    "photos/12.jpg", "photos/06.jpg",   // 6. смешной фильтр + котик в пледе
    "photos/09.jpg", "photos/10.jpg",   // 7. очки + ушки
    "photos/05.jpg"                     // 8. последнее фото (справа — финальная страница)
  ],

  // Подписи сверху — по одной на каждый разворот книги
  messages: [
    "Happy Birthday, my love 🤍",
    "I could get lost in your eyes forever.",
    "My favourite little bear 🐻",
    "Even your silliest side is perfect to me.",
    "Thank you for every laugh and every funny face 😂",
    "You make every single day warmer and brighter.",
    "As long as you're smiling, I'm happy. Stay happy, my love.",
    "May all your wishes come true today 🎂"
  ],

  // Надпись на последней странице книги
  lastPage: "I love you ♥"
};
