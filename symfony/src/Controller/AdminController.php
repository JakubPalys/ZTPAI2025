<?php

namespace App\Controller;

use App\Entity\Event;
use App\Repository\EventRepository;
use App\Repository\UserRepository;
use App\Repository\UserRoleRepository;
use App\Repository\BetRepository;
use App\Repository\ResultRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use OpenApi\Attributes as OA;

class AdminController extends AbstractController
{
    private EventRepository $eventRepository;
    private UserRepository $userRepository;
    private UserRoleRepository $userRoleRepository;
    private ResultRepository $resultRepository;
    private BetRepository $betRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        EventRepository $eventRepository,
        UserRoleRepository $userRoleRepository,
        UserRepository $userRepository,
        BetRepository $betRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->eventRepository = $eventRepository;
        $this->userRepository = $userRepository;
        $this->betRepository = $betRepository;
        $this->userRoleRepository = $userRoleRepository;
        $this->entityManager = $entityManager;
    }

    private function checkAdmin(SessionInterface $session, UserRepository $userRepository): ?JsonResponse
    {
        $userId = $session->get('user_id');
        if (!$userId) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        $user = $userRepository->find($userId);
        if (!$user || $user->getRole()->getRoleName() !== 'admin') {
            return $this->json(['error' => 'Access denied. Admin privileges required.'], 403);
        }

        return null;
    }

    #[Route('/api/admin', name: 'admin_menu')]
    #[OA\Get(
        path: '/api/admin',
        summary: 'Menu admina: lista wydarzeń i użytkowników',
        tags: ['admin'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Zwraca listę wydarzeń i użytkowników'
            ),
            new OA\Response(response: 401, description: 'Brak autoryzacji'),
            new OA\Response(response: 403, description: 'Brak uprawnień admina')
        ]
    )]
    public function adminMenu(SessionInterface $session): JsonResponse
    {
        $checkAdminResponse = $this->checkAdmin($session, $this->userRepository);
        if ($checkAdminResponse) {
            return $checkAdminResponse;
        }

        $events = $this->eventRepository->findAll();
        $users = $this->userRepository->findAll();

        $eventsData = [];
        foreach ($events as $event) {
            $eventsData[] = [
                'id' => $event->getId(),
                'event_name' => $event->getEventName(),
                'event_date' => $event->getEventDate()->format('Y-m-d H:i:s'),
                'home_odds' => $event->getHomeOdds(),
                'away_odds' => $event->getAwayOdds(),
                'draw_odds' => $event->getDrawOdds(),
                'status' => $event->getStatusId(),
            ];
        }

        $usersData = [];
        foreach ($users as $user) {
            $usersData[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'role' => $user->getRole()->getRoleName(),
            ];
        }

        return $this->json([
            'events' => $eventsData,
            'users' => $usersData,
        ]);
    }

    #[Route('/api/admin/add-event', name: 'admin_add_event', methods: ['POST'])]
    #[OA\Post(
        path: '/api/admin/add-event',
        summary: 'Dodaj nowe wydarzenie',
        tags: ['admin'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['event_name', 'event_date', 'home_odds', 'away_odds', 'draw_odds'],
                properties: [
                    new OA\Property(property: 'event_name', type: 'string'),
                    new OA\Property(property: 'event_date', type: 'string'),
                    new OA\Property(property: 'home_odds', type: 'number'),
                    new OA\Property(property: 'away_odds', type: 'number'),
                    new OA\Property(property: 'draw_odds', type: 'number'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Wydarzenie dodane'),
            new OA\Response(response: 401, description: 'Brak autoryzacji'),
            new OA\Response(response: 403, description: 'Brak uprawnień admina')
        ]
    )]
    public function addEvent(Request $request, SessionInterface $session): JsonResponse
    {
        $checkAdminResponse = $this->checkAdmin($session, $this->userRepository);
        if ($checkAdminResponse) {
            return $checkAdminResponse;
        }

        $event = new Event();
        $event->setEventName($request->request->get('event_name'));
        $event->setEventDate(new \DateTime($request->request->get('event_date')));
        $event->setHomeOdds((float)$request->request->get('home_odds'));
        $event->setAwayOdds((float)$request->request->get('away_odds'));
        $event->setDrawOdds((float)$request->request->get('draw_odds'));
        $event->setStatusId(1);

        $this->entityManager->persist($event);
        $this->entityManager->flush();

        return $this->json(['success' => 'Event added successfully']);
    }

    #[Route('/api/admin/delete-event', name: 'admin_delete_event', methods: ['POST'])]
    #[OA\Post(
        path: '/api/admin/delete-event',
        summary: 'Usuń wydarzenie',
        tags: ['admin'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['event_id'],
                properties: [
                    new OA\Property(property: 'event_id', type: 'integer'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Wydarzenie usunięte'),
            new OA\Response(response: 404, description: 'Nie znaleziono wydarzenia'),
            new OA\Response(response: 401, description: 'Brak autoryzacji'),
            new OA\Response(response: 403, description: 'Brak uprawnień admina')
        ]
    )]
    public function deleteEvent(Request $request, SessionInterface $session): JsonResponse
    {
        $checkAdminResponse = $this->checkAdmin($session, $this->userRepository);
        if ($checkAdminResponse) {
            return $checkAdminResponse;
        }

        $eventId = $request->request->get('event_id');
        $event = $this->eventRepository->find($eventId);

        if ($event) {
            $statusId = $event->getStatusId();

            $bets = $this->betRepository->findBy(['event' => $event]);
            $betsCount = 0;

            foreach ($bets as $bet) {
                $user = $bet->getUser();
                if ($statusId == 1 && $user && $bet->getBetAmount()) {
                    $user->setPoints($user->getPoints() + $bet->getBetAmount());
                }
                $this->entityManager->remove($bet);
                $betsCount++;
            }

            $this->entityManager->remove($event);
            $this->entityManager->flush();
            return $this->json([
                'success' => 'Event deleted successfully. Deleted bets: ' . $betsCount
            ]);
        }

        return $this->json(['error' => 'Event not found'], 404);
    }

    #[Route('/api/admin/finish-event', name: 'admin_finish_event', methods: ['POST'])]
    #[OA\Post(
        path: '/api/admin/finish-event',
        summary: 'Rozlicz wydarzenie i zakłady',
        tags: ['admin'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['event_id', 'bet_result_id'],
                properties: [
                    new OA\Property(property: 'event_id', type: 'integer'),
                    new OA\Property(property: 'bet_result_id', type: 'integer'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Wydarzenie rozliczone'),
            new OA\Response(response: 400, description: 'Brak wymaganych danych lub błędny wynik'),
            new OA\Response(response: 404, description: 'Nie znaleziono wydarzenia'),
            new OA\Response(response: 401, description: 'Brak autoryzacji'),
            new OA\Response(response: 403, description: 'Brak uprawnień admina')
        ]
    )]
    public function finishEvent(Request $request, ResultRepository $resultRepository, SessionInterface $session): JsonResponse
    {
        $checkAdminResponse = $this->checkAdmin($session, $this->userRepository);
        if ($checkAdminResponse) {
            return $checkAdminResponse;
        }

        $eventId = $request->request->get('event_id');
        $betResultId = $request->request->get('bet_result_id');
        if (!$eventId || !$betResultId) {
            return $this->json(['error' => 'Brak event_id lub bet_result_id'], 400);
        }

        $event = $this->eventRepository->find($eventId);

        if (!$event) {
            return $this->json(['error' => 'Event not found'], 404);
        }

        $result = $resultRepository->find($betResultId);
        if (!$result) {
            return $this->json(['error' => 'Invalid bet_result_id'], 400);
        }

        $event->setStatusId(2);
        $event->setResult($result);

        $bets = $this->betRepository->findBy(['event' => $event]);
        $winners = 0;
        $losers = 0;
        foreach ($bets as $bet) {
            if ($bet->getBetChoice() === $result->getResultName()) {
                $bet->setOutcome(1); 
                $user = $bet->getUser();
                $user->setPoints($user->getPoints() + $bet->getPotentialWin());
                $winners++;
            } else {
                $bet->setOutcome(2);
                $losers++;
            }
        }

        $this->entityManager->flush();

        return $this->json([
            'success' => "Event finished and bets settled",
            'winners' => $winners,
            'losers' => $losers,
        ]);
    }

    #[Route('/api/admin/users', name: 'admin_list_users', methods: ['GET'])]
    #[OA\Get(
        path: '/api/admin/users',
        summary: 'Lista wszystkich użytkowników',
        tags: ['admin'],
        responses: [
            new OA\Response(response: 200, description: 'Zwraca listę użytkowników'),
            new OA\Response(response: 401, description: 'Brak autoryzacji'),
            new OA\Response(response: 403, description: 'Brak uprawnień admina')
        ]
    )]
    public function listUsers(SessionInterface $session): JsonResponse
    {
        $checkAdminResponse = $this->checkAdmin($session, $this->userRepository);
        if ($checkAdminResponse) {
            return $checkAdminResponse;
        }

        $users = $this->userRepository->findAll();
        $usersData = [];
        foreach ($users as $user) {
            $usersData[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'role' => $user->getRole()->getRoleName(),
                'points' => $user->getPoints(),
            ];
        }

        return $this->json(['users' => $usersData]);
    }

    #[Route('/api/admin/users/{id}', name: 'admin_user_details', methods: ['GET', 'PUT', 'DELETE'])]
    #[OA\Get(
        path: '/api/admin/users/{id}',
        summary: 'Szczegóły użytkownika',
        tags: ['admin'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                description: 'ID użytkownika'
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Zwraca dane użytkownika'),
            new OA\Response(response: 404, description: 'Nie znaleziono użytkownika'),
            new OA\Response(response: 401, description: 'Brak autoryzacji'),
            new OA\Response(response: 403, description: 'Brak uprawnień admina')
        ]
    )]
    #[OA\Put(
        path: '/api/admin/users/{id}',
        summary: 'Edytuj dane użytkownika',
        tags: ['admin'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                description: 'ID użytkownika'
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'username', type: 'string'),
                    new OA\Property(property: 'email', type: 'string'),
                    new OA\Property(property: 'role', type: 'string'),
                    new OA\Property(property: 'points', type: 'integer'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Zaktualizowano użytkownika'),
            new OA\Response(response: 400, description: 'Błąd walidacji/rola nie istnieje'),
            new OA\Response(response: 404, description: 'Nie znaleziono użytkownika'),
            new OA\Response(response: 401, description: 'Brak autoryzacji'),
            new OA\Response(response: 403, description: 'Brak uprawnień admina')
        ]
    )]
    #[OA\Delete(
        path: '/api/admin/users/{id}',
        summary: 'Usuń użytkownika',
        tags: ['admin'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                description: 'ID użytkownika'
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Użytkownik usunięty'),
            new OA\Response(response: 404, description: 'Nie znaleziono użytkownika'),
            new OA\Response(response: 401, description: 'Brak autoryzacji'),
            new OA\Response(response: 403, description: 'Brak uprawnień admina')
        ]
    )]
    public function userDetails(int $id, Request $request, SessionInterface $session): JsonResponse
    {
        $checkAdminResponse = $this->checkAdmin($session, $this->userRepository);
        if ($checkAdminResponse) {
            return $checkAdminResponse;
        }

        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }
        if ($request->isMethod('GET')) {
            return $this->json([
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'role' => $user->getRole()->getRoleName(),
                'points' => $user->getPoints(),
            ]);
        }

        if ($request->isMethod('PUT')) {
            $data = json_decode($request->getContent(), true);

            if (isset($data['username'])) {
                $user->setUsername($data['username']);
            }
            if (isset($data['email'])) {
                $user->setEmail($data['email']);
            }
            if (isset($data['points'])) {
                $user->setPoints((int)$data['points']);
            }
            if (isset($data['role'])) {
                $role = $this->userRoleRepository->findOneBy(['role_name' => $data['role']]);
                if ($role) {
                    $user->setRole($role);
                } else {
                    return $this->json(['error' => 'Podana rola nie istnieje.'], 400);
                }
            }

            $this->entityManager->flush();

            return $this->json(['success' => 'User updated successfully']);
        }

        if ($request->isMethod('DELETE')) {
            $this->entityManager->remove($user);
            $this->entityManager->flush();

            return $this->json(['success' => 'User deleted successfully']);
        }

        return $this->json(['error' => 'Invalid method'], 405);
    }

    #[Route('/api/admin/add-points', name: 'admin_add_points', methods: ['POST'])]
    #[OA\Post(
        path: '/api/admin/add-points',
        summary: 'Dodaj punkty wszystkim użytkownikom',
        tags: ['admin'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['points'],
                properties: [
                    new OA\Property(property: 'points', type: 'integer', description: 'Liczba punktów do dodania (może być ujemna)')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Dodano punkty wszystkim użytkownikom'),
            new OA\Response(response: 400, description: 'Nieprawidłowe dane lub 0 punktów'),
            new OA\Response(response: 401, description: 'Brak autoryzacji'),
            new OA\Response(response: 403, description: 'Brak uprawnień admina')
        ]
    )]
    public function addPointsToAllUsers(Request $request, SessionInterface $session): JsonResponse
    {
        $checkAdminResponse = $this->checkAdmin($session, $this->userRepository);
        if ($checkAdminResponse) {
            return $checkAdminResponse;
        }
    
        $points = $request->request->get('points');
        if ($points === null) {
            $data = json_decode($request->getContent(), true);
            $points = $data['points'] ?? null;
        }
    
        if ($points === null || !is_numeric($points)) {
            return $this->json(['error' => 'Musisz podać liczbę punktów.'], 400);
        }
    
        $points = (int)$points;
        if ($points === 0) {
            return $this->json(['error' => 'Liczba punktów nie może być zerowa.'], 400);
        }
    
        $users = $this->userRepository->findAll();
        $count = 0;
        foreach ($users as $user) {
            $user->setPoints($user->getPoints() + $points);
            $count++;
        }
        $this->entityManager->flush();
    
        return $this->json([
            'success' => "Dodano $points punktów do $count użytkowników.",
            'points_added' => $points,
            'users_count' => $count
        ]);
    }
}