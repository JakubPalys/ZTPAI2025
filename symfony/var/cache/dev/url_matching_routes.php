<?php

/**
 * This file has been auto-generated
 * by the Symfony Routing Component.
 */

return [
    false, // $matchHost
    [ // $staticRoutes
        '/admin' => [[['_route' => 'admin_menu', '_controller' => 'App\\Controller\\AdminController::adminMenu'], null, null, null, false, false, null]],
        '/admin/add-event' => [[['_route' => 'admin_add_event', '_controller' => 'App\\Controller\\AdminController::addEvent'], null, ['POST' => 0], null, false, false, null]],
        '/admin/delete-event' => [[['_route' => 'admin_delete_event', '_controller' => 'App\\Controller\\AdminController::deleteEvent'], null, ['POST' => 0], null, false, false, null]],
        '/admin/finish-event' => [[['_route' => 'admin_finish_event', '_controller' => 'App\\Controller\\AdminController::finishEvent'], null, ['POST' => 0], null, false, false, null]],
        '/' => [[['_route' => 'index', '_controller' => 'App\\Controller\\HomeController::index'], null, null, null, false, false, null]],
        '/home' => [[['_route' => 'home', '_controller' => 'App\\Controller\\HomeController::home'], null, null, null, false, false, null]],
        '/place-bet' => [[['_route' => 'place_bet', '_controller' => 'App\\Controller\\HomeController::placeBet'], null, ['POST' => 0], null, false, false, null]],
        '/logout' => [[['_route' => 'logout', '_controller' => 'App\\Controller\\HomeController::logout'], null, null, null, false, false, null]],
        '/profile' => [[['_route' => 'profile', '_controller' => 'App\\Controller\\ProfileController::profile'], null, null, null, false, false, null]],
        '/profile/change-password' => [[['_route' => 'change_password', '_controller' => 'App\\Controller\\ProfileController::changePassword'], null, ['POST' => 0], null, false, false, null]],
        '/profile/delete' => [[['_route' => 'delete_account', '_controller' => 'App\\Controller\\ProfileController::deleteAccount'], null, ['POST' => 0], null, false, false, null]],
        '/api/users' => [[['_route' => 'get_users', '_controller' => 'App\\Controller\\SecurityController::getUsers'], null, ['GET' => 0], null, false, false, null]],
        '/api/me' => [[['_route' => 'me', '_controller' => 'App\\Controller\\SecurityController::me'], null, ['GET' => 0], null, false, false, null]],
        '/api/login' => [[['_route' => 'login', '_controller' => 'App\\Controller\\SecurityController::login'], null, ['POST' => 0], null, false, false, null]],
        '/api/register' => [[['_route' => 'register', '_controller' => 'App\\Controller\\SecurityController::register'], null, ['POST' => 0], null, false, false, null]],
    ],
    [ // $regexpList
        0 => '{^(?'
                .'|/_error/(\\d+)(?:\\.([^/]++))?(*:35)'
                .'|/api/users/([^/]++)(*:61)'
            .')/?$}sDu',
    ],
    [ // $dynamicRoutes
        35 => [[['_route' => '_preview_error', '_controller' => 'error_controller::preview', '_format' => 'html'], ['code', '_format'], null, null, false, true, null]],
        61 => [
            [['_route' => 'get_user', '_controller' => 'App\\Controller\\SecurityController::getUserById'], ['id'], ['GET' => 0], null, false, true, null],
            [null, null, null, null, false, false, 0],
        ],
    ],
    null, // $checkCondition
];
