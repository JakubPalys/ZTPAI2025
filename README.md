# Bukmacher Gra Online – Bettson

## Opis projektu

Bukmacher Online to aplikacja webowa będąca symulacją gry bukmacherskiej. Użytkownik może:
- rejestrować się i logować,
- przeglądać wydarzenia sportowe,
- obstawiać zakłady na wybrane zdarzenia (wygrana gospodarzy, remis, wygrana gości),
- zarządzać swoim profilem i historią zakładów,
- administrator może rozliczać wydarzenia, dodawać je i zarządzać użytkownikami.

---

## Schemat architektury

Aplikacja składa się z backendu (PHP Symfony, REST API) oraz frontend (React). Dane przechowywane są w bazie MySQL uruchamianej w kontenerze Docker.

## Instrukcja uruchomienia

### 1. Klonowanie repozytorium

```sh
git clone <repo-url>
cd <repo-folder>
```

### 2. Uruchomienie bazy danych i backend (MySQL + Docker)

```sh
cd .\symfony\
docker-compose up -d
```

### 3. Frontend (React)

- Przejdź do katalogu frontend:
    ```sh
    cd .\react\ztpai\
    ```
- Zainstaluj zależności:
    ```sh
    npm install
    ```
- Uruchom frontend:
    ```sh
    npm run dev
    ```
- Aplikacja dostępna na [http://localhost:5173/](http://localhost:5173/)

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

