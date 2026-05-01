## Команды для бэка
   ```bash
   # Создать приложение в джанго
      docker-compose exec backend python manage.py startapp <название приложения>
   
   # Создать суперюзера для админской части (там с бд можно работать)
      docker-compose exec backend python manage.py createsuperuser

   ```

## Команды для бд
   ```bash
   # Создать пустой файл миграции
      docker-compose exec backend python manage.py makemigrations <приложение> --empty --name <название_миграции>

   # Создать (на основе моделек) / Запустить / Откатить миграции
      docker-compose exec backend python manage.py makemigrations <приложение>
      docker-compose exec backend python manage.py migrate
      docker-compose exec backend python manage.py migrate <приложение> 0001

   # Зайти в консоль постгреса через терминал
      docker-compose exec db psql -U <ваш DB_USER из файла .env> -d MakeYourChoice_db
   ```