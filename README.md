# Dental CRM Backend

Backend для системы управления стоматологической клиникой. Написан на NestJS и TypeScript.

## Статус

Проект находится на начальном этапе: доступен стартовый endpoint `GET /`. Подготовлены PostgreSQL в Docker, подключение через Prisma 7 и модель пациента; API пациентов ещё не реализован.

Текущий контракт, ожидаемый frontend, описан в [`../docs/api.md`](../docs/api.md).

## Запуск

```bash
npm install
npm run db:generate
npm run start:dev
```

По умолчанию сервер слушает порт `3002`. Для другого порта задайте переменную окружения `PORT`.

```powershell
$env:PORT=3003
npm run start:dev
```

## Проверки

Перед первым запуском подготовьте базу данных из папки backend:

```powershell
docker compose up -d
```

Создайте `.env` по образцу `.env.example`, указав учётные данные из `compose.yaml`. PostgreSQL доступен на `127.0.0.1:5433`.

Создайте и примените первую миграцию:

```powershell
npm run db:migrate -- --name init_patients
npm run db:generate
```

Prisma Client генерируется в `src/generated/prisma/` и не хранится в Git. Сборка также запускает генерацию. Сервер подключается к базе при запуске; для e2e-проверок нужна работающая тестовая база в `DATABASE_URL`.

```bash
npm run lint
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

## План

1. Подключить базу данных и конфигурацию окружения.
2. Реализовать модуль пациентов: CRUD, поиск, сортировку и пагинацию.
3. Подключить frontend вместо json-server.
4. Добавить модули врачей, услуг, записей и платежей.
