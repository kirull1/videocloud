/**
 * Интерфейс для локализованных сообщений
 */
export interface TranslationItem {
  ru: string;
  en: string;
}

export interface TranslationCategory {
  [key: string]: TranslationItem;
}

export interface Translations {
  [key: string]: TranslationCategory;
}

/**
 * Локализованные сообщения для системы
 */
export const translations: Translations = {
  common: {
    hello: {
      ru: 'Привет',
      en: 'Hello'
    },
    welcome: {
      ru: 'Добро пожаловать в VideoCloud',
      en: 'Welcome to VideoCloud'
    },
    notFound: {
      ru: 'Не найдено',
      en: 'Not found'
    },
    error: {
      ru: 'Ошибка',
      en: 'Error'
    },
    success: {
      ru: 'Успешно',
      en: 'Success'
    },
    save: {
      ru: 'Сохранить',
      en: 'Save'
    },
    cancel: {
      ru: 'Отмена',
      en: 'Cancel'
    },
    confirm: {
      ru: 'Подтвердить',
      en: 'Confirm'
    },
    delete: {
      ru: 'Удалить',
      en: 'Delete'
    },
    edit: {
      ru: 'Редактировать',
      en: 'Edit'
    },
    search: {
      ru: 'Поиск',
      en: 'Search'
    },
    loading: {
      ru: 'Загрузка...',
      en: 'Loading...'
    },
    noResults: {
      ru: 'Нет результатов',
      en: 'No results'
    },
  },
  auth: {
    loginSuccess: {
      ru: 'Вход выполнен успешно',
      en: 'Login successful'
    },
    loginFailed: {
      ru: 'Ошибка входа: неверный email или пароль',
      en: 'Login failed: invalid email or password'
    },
    registrationSuccess: {
      ru: 'Регистрация прошла успешно',
      en: 'Registration successful'
    },
    emailVerified: {
      ru: 'Email успешно подтвержден',
      en: 'Email verified successfully'
    },
    passwordChanged: {
      ru: 'Пароль успешно изменен',
      en: 'Password changed successfully'
    },
    login: {
      ru: 'Войти',
      en: 'Login'
    },
    register: {
      ru: 'Зарегистрироваться',
      en: 'Register'
    },
    logout: {
      ru: 'Выйти',
      en: 'Logout'
    },
    email: {
      ru: 'Электронная почта',
      en: 'Email'
    },
    password: {
      ru: 'Пароль',
      en: 'Password'
    },
    confirmPassword: {
      ru: 'Подтвердите пароль',
      en: 'Confirm password'
    },
    username: {
      ru: 'Имя пользователя',
      en: 'Username'
    },
    forgotPassword: {
      ru: 'Забыли пароль?',
      en: 'Forgot password?'
    },
    resetPassword: {
      ru: 'Сбросить пароль',
      en: 'Reset password'
    },
    newPassword: {
      ru: 'Новый пароль',
      en: 'New password'
    },
    resetPasswordSuccess: {
      ru: 'Инструкции по сбросу пароля отправлены на ваш email',
      en: 'Password reset instructions have been sent to your email'
    },
    invalidToken: {
      ru: 'Недействительный или истекший токен',
      en: 'Invalid or expired token'
    },
    unauthorized: {
      ru: 'Не авторизован',
      en: 'Unauthorized'
    },
    verifyEmail: {
      ru: 'Подтвердите ваш email',
      en: 'Verify your email'
    },
    verificationSent: {
      ru: 'Письмо с подтверждением отправлено на ваш email',
      en: 'Verification email has been sent'
    },
  },
  videos: {
    uploadSuccess: {
      ru: 'Видео успешно загружено',
      en: 'Video uploaded successfully'
    },
    processing: {
      ru: 'Видео успешно загружено, сейчас выполняется обработка',
      en: 'Video uploaded successfully, now processing'
    },
    fileRequired: {
      ru: 'Необходимо загрузить видеофайл',
      en: 'Video file is required'
    },
    emptyFile: {
      ru: 'Пустой файл или отсутствует содержимое',
      en: 'Empty file or missing buffer'
    },
    deleted: {
      ru: 'Видео удалено',
      en: 'Video deleted'
    },
    notFound: {
      ru: 'Видео не найдено',
      en: 'Video not found'
    },
    title: {
      ru: 'Заголовок',
      en: 'Title'
    },
    description: {
      ru: 'Описание',
      en: 'Description'
    },
    upload: {
      ru: 'Загрузить видео',
      en: 'Upload video'
    },
    category: {
      ru: 'Категория',
      en: 'Category'
    },
    tags: {
      ru: 'Теги',
      en: 'Tags'
    },
    visibility: {
      ru: 'Видимость',
      en: 'Visibility'
    },
    public: {
      ru: 'Публичное',
      en: 'Public'
    },
    private: {
      ru: 'Приватное',
      en: 'Private'
    },
    unlisted: {
      ru: 'По ссылке',
      en: 'Unlisted'
    },
    duration: {
      ru: 'Длительность',
      en: 'Duration'
    },
    views: {
      ru: 'Просмотры',
      en: 'Views'
    },
    likes: {
      ru: 'Лайки',
      en: 'Likes'
    },
    dislikes: {
      ru: 'Дизлайки',
      en: 'Dislikes'
    },
    uploadDate: {
      ru: 'Дата загрузки',
      en: 'Upload date'
    },
    thumbnail: {
      ru: 'Миниатюра',
      en: 'Thumbnail'
    },
    customThumbnail: {
      ru: 'Загрузить свою миниатюру',
      en: 'Upload custom thumbnail'
    },
    quality: {
      ru: 'Качество',
      en: 'Quality'
    },
    processingStatus: {
      ru: 'Статус обработки',
      en: 'Processing status'
    },
    processingComplete: {
      ru: 'Обработка завершена',
      en: 'Processing complete'
    },
    processingFailed: {
      ru: 'Ошибка обработки',
      en: 'Processing failed'
    },
    watchNow: {
      ru: 'Смотреть',
      en: 'Watch now'
    },
  },
  comments: {
    added: {
      ru: 'Комментарий добавлен',
      en: 'Comment added'
    },
    deleted: {
      ru: 'Комментарий удален',
      en: 'Comment deleted'
    },
    updated: {
      ru: 'Комментарий обновлен',
      en: 'Comment updated'
    },
    replyAdded: {
      ru: 'Ответ добавлен',
      en: 'Reply added'
    },
    writeComment: {
      ru: 'Написать комментарий...',
      en: 'Write a comment...'
    },
    reply: {
      ru: 'Ответить',
      en: 'Reply'
    },
    showReplies: {
      ru: 'Показать ответы',
      en: 'Show replies'
    },
    hideReplies: {
      ru: 'Скрыть ответы',
      en: 'Hide replies'
    },
    commentCount: {
      ru: 'Комментарии',
      en: 'Comments'
    },
    noComments: {
      ru: 'Нет комментариев',
      en: 'No comments'
    },
    beFirst: {
      ru: 'Будьте первым, кто оставит комментарий',
      en: 'Be the first to comment'
    },
    reportComment: {
      ru: 'Пожаловаться',
      en: 'Report'
    },
  },
  channels: {
    created: {
      ru: 'Канал создан',
      en: 'Channel created'
    },
    updated: {
      ru: 'Канал обновлен',
      en: 'Channel updated'
    },
    deleted: {
      ru: 'Канал удален',
      en: 'Channel deleted'
    },
    subscribed: {
      ru: 'Вы подписались на канал',
      en: 'You have subscribed to the channel'
    },
    unsubscribed: {
      ru: 'Вы отписались от канала',
      en: 'You have unsubscribed from the channel'
    },
    myChannel: {
      ru: 'Мой канал',
      en: 'My channel'
    },
    yourChannel: {
      ru: 'Это ваш канал',
      en: 'This is your channel'
    },
    subscribe: {
      ru: 'Подписаться',
      en: 'Subscribe'
    },
    unsubscribe: {
      ru: 'Отписаться',
      en: 'Unsubscribe'
    },
    subscribers: {
      ru: 'Подписчики',
      en: 'Subscribers'
    },
    videos: {
      ru: 'Видео',
      en: 'Videos'
    },
    about: {
      ru: 'О канале',
      en: 'About'
    },
    analytics: {
      ru: 'Аналитика',
      en: 'Analytics'
    },
    settings: {
      ru: 'Настройки',
      en: 'Settings'
    },
    createChannel: {
      ru: 'Создать канал',
      en: 'Create channel'
    },
    channelName: {
      ru: 'Название канала',
      en: 'Channel name'
    },
    channelDescription: {
      ru: 'Описание канала',
      en: 'Channel description'
    },
    customUrl: {
      ru: 'Уникальный URL',
      en: 'Custom URL'
    },
    joinedDate: {
      ru: 'Дата регистрации',
      en: 'Joined on'
    },
    totalViews: {
      ru: 'Всего просмотров',
      en: 'Total views'
    },
  },
  user: {
    profile: {
      ru: 'Профиль',
      en: 'Profile'
    },
    settings: {
      ru: 'Настройки',
      en: 'Settings'
    },
    avatar: {
      ru: 'Аватар',
      en: 'Avatar'
    },
    changeAvatar: {
      ru: 'Изменить аватар',
      en: 'Change avatar'
    },
    uploadAvatar: {
      ru: 'Загрузить аватар',
      en: 'Upload avatar'
    },
    personalInfo: {
      ru: 'Личная информация',
      en: 'Personal information'
    },
    updateProfile: {
      ru: 'Обновить профиль',
      en: 'Update profile'
    },
    changePassword: {
      ru: 'Изменить пароль',
      en: 'Change password'
    },
    currentPassword: {
      ru: 'Текущий пароль',
      en: 'Current password'
    },
    accountCreated: {
      ru: 'Аккаунт создан',
      en: 'Account created'
    },
    savedVideos: {
      ru: 'Сохраненные видео',
      en: 'Saved videos'
    },
    history: {
      ru: 'История просмотров',
      en: 'Watch history'
    },
    subscriptions: {
      ru: 'Подписки',
      en: 'Subscriptions'
    },
  },
  errors: {
    generalError: {
      ru: 'Что-то пошло не так. Пожалуйста, попробуйте позже.',
      en: 'Something went wrong. Please try again later.'
    },
    notFound: {
      ru: 'Страница не найдена',
      en: 'Page not found'
    },
    serverError: {
      ru: 'Ошибка сервера',
      en: 'Server error'
    },
    unauthorized: {
      ru: 'Требуется авторизация',
      en: 'Authorization required'
    },
    forbidden: {
      ru: 'Доступ запрещен',
      en: 'Access forbidden'
    },
    validationError: {
      ru: 'Ошибка валидации',
      en: 'Validation error'
    },
    fieldRequired: {
      ru: 'Это поле обязательно',
      en: 'This field is required'
    },
    invalidEmail: {
      ru: 'Некорректный email',
      en: 'Invalid email'
    },
    passwordTooShort: {
      ru: 'Пароль должен содержать минимум 8 символов',
      en: 'Password must be at least 8 characters long'
    },
    passwordMismatch: {
      ru: 'Пароли не совпадают',
      en: 'Passwords do not match'
    },
    userExists: {
      ru: 'Пользователь с таким email уже существует',
      en: 'User with this email already exists'
    },
    channelExists: {
      ru: 'Канал с таким URL уже существует',
      en: 'Channel with this URL already exists'
    },
  },
  navigation: {
    home: {
      ru: 'Главная',
      en: 'Home'
    },
    trending: {
      ru: 'В тренде',
      en: 'Trending'
    },
    subscriptions: {
      ru: 'Подписки',
      en: 'Subscriptions'
    },
    library: {
      ru: 'Библиотека',
      en: 'Library'
    },
    history: {
      ru: 'История',
      en: 'History'
    },
    yourVideos: {
      ru: 'Ваши видео',
      en: 'Your videos'
    },
    watchLater: {
      ru: 'Смотреть позже',
      en: 'Watch later'
    },
    likedVideos: {
      ru: 'Понравившиеся',
      en: 'Liked videos'
    },
    categories: {
      ru: 'Категории',
      en: 'Categories'
    },
    playlists: {
      ru: 'Плейлисты',
      en: 'Playlists'
    },
    settings: {
      ru: 'Настройки',
      en: 'Settings'
    },
    help: {
      ru: 'Справка',
      en: 'Help'
    },
    feedback: {
      ru: 'Отправить отзыв',
      en: 'Send feedback'
    },
  },
  player: {
    play: {
      ru: 'Воспроизвести',
      en: 'Play'
    },
    pause: {
      ru: 'Пауза',
      en: 'Pause'
    },
    mute: {
      ru: 'Выключить звук',
      en: 'Mute'
    },
    unmute: {
      ru: 'Включить звук',
      en: 'Unmute'
    },
    fullscreen: {
      ru: 'Полный экран',
      en: 'Fullscreen'
    },
    exitFullscreen: {
      ru: 'Выйти из полного экрана',
      en: 'Exit fullscreen'
    },
    speed: {
      ru: 'Скорость',
      en: 'Speed'
    },
    normal: {
      ru: 'Обычная',
      en: 'Normal'
    },
    quality: {
      ru: 'Качество',
      en: 'Quality'
    },
    auto: {
      ru: 'Авто',
      en: 'Auto'
    },
    pip: {
      ru: 'Картинка в картинке',
      en: 'Picture-in-picture'
    },
    exitPip: {
      ru: 'Выйти из режима "картинка в картинке"',
      en: 'Exit picture-in-picture'
    },
  },
}; 