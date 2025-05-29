# Bukmacher Online – Aplikacja Internetowa

## Opis projektu

Bukmacher Online to aplikacja webowa będąca symulacją gry bukmacherskiej. Użytkownik może:
- rejestrować się i logować,
- przeglądać wydarzenia sportowe,
- obstawiać zakłady na wybrane zdarzenia (wygrana gospodarzy, remis, wygrana gości),
- zarządzać swoim profilem i historią zakładów,
- administrator może rozliczać wydarzenia, dodawać je i zarządzać użytkownikami.

Aplikacja składa się z backendu (PHP Symfony, REST API) oraz frontend (React). Dane przechowywane są w bazie MySQL uruchamianej w kontenerze Docker.

---

## Schemat architektury

```mermaid
flowchart TD
    subgraph Frontend [React]
        A1[Strona główna]
        A2[Panel użytkownika]
        A3[Panel admina]
    end
    subgraph Backend [Symfony PHP REST API]
        B1[Kontrolery API]
        B2[Logika gry]
        B3[Autoryzacja sesyjna]
    end
    subgraph Database [MySQL (Docker)]
        C1[Tabela users]
        C2[Tabela events]
        C3[Tabela bets]
        C4[Tabela roles]
        C5[Tabela results]
    end

    A1 -->|HTTP JSON| B1
    A2 -->|HTTP JSON| B1
    A3 -->|HTTP JSON| B1
    B1 -->|Doctrine ORM| C1
    B1 -->|Doctrine ORM| C2
    B1 -->|Doctrine ORM| C3
    B1 -->|Doctrine ORM| C4
    B1 -->|Doctrine ORM| C5
```

---

## Instrukcja uruchomienia

### 1. Klonowanie repozytorium

```sh
git clone <repo-url>
cd <repo-folder>
```

### 2. Uruchomienie bazy danych (MySQL + Docker)

```sh
docker-compose up -d
# lub ręcznie:
docker run --name bukmacher-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=bukmacher -p 3306:3306 -d mysql:8
```

### 3. Backend (PHP Symfony)

- Przejdź do katalogu backend:
    ```sh
    cd backend
    ```
- Zainstaluj zależności:
    ```sh
    composer install
    ```
- Skonfiguruj `.env` (dane do bazy):
    ```
    DATABASE_URL="mysql://root:root@127.0.0.1:3306/bukmacher"
    ```
- Wykonaj migracje:
    ```sh
    php bin/console doctrine:migrations:migrate
    ```
- Uruchom backend:
    ```sh
    symfony server:start
    # lub
    php -S 127.0.0.1:8000 -t public
    ```

### 4. Frontend (React)

- Przejdź do katalogu frontend:
    ```sh
    cd frontend
    ```
- Zainstaluj zależności:
    ```sh
    npm install
    ```
- Uruchom frontend:
    ```sh
    npm start
    ```
- Aplikacja dostępna na [http://localhost:3000](http://localhost:3000)

---

## Użyte technologie i uzasadnienie wyboru

- **PHP Symfony**  
  Solidny framework do budowy rozbudowanych API. Oferuje rozbudowany ORM (Doctrine), łatwą integrację z Dockerem i świetną obsługę bezpieczeństwa oraz sesji.
- **React**  
  Najpopularniejsza biblioteka do budowy interfejsów webowych SPA. Pozwala na dynamiczną, responsywną obsługę użytkownika i dobre zarządzanie stanem aplikacji.
- **MySQL (Docker)**  
  Stabilna, szybka, relacyjna baza danych – łatwo ją uruchomić w Dockerze, co zapewnia powtarzalność i łatwość wdrożenia.
- **Docker**  
  Umożliwia szybkie stawianie środowiska deweloperskiego oraz produkcyjnego niezależnie od systemu.
- **Doctrine ORM**  
  Pozwala na wygodne mapowanie obiektowo-relacyjne w PHP i łatwą migrację bazy danych.
- **NelmioApiDocBundle, OpenAPI**  
  Automatyczna dokumentacja API do łatwiejszego testowania i rozwijania aplikacji.

---

## Autorzy

- Jakub Palys

---

## Licencja

MIT
