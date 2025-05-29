<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use App\Repository\EventRepository;
use App\Repository\BetRepository;
use App\Entity\Bet;
use App\Entity\User;
use App\Entity\Event;
use OpenApi\Attributes as OA;

class HomeController extends AbstractController
{
    private UserRepository $userRepository;
    private EventRepository $eventRepository;
    private BetRepository $betRepository;
    private EntityManagerInterface $entityManager;
    
    public function __construct(UserRepository $userRepository, EventRepository $eventRepository, BetRepository $betRepository, EntityManagerInterface $entityManager)
    {
        $this->userRepository = $userRepository;
        $this->eventRepository = $eventRepository;
        $this->betRepository = $betRepository;
        $this->entityManager = $entityManager;
    }

    #[Route('/api/home', name: 'home')]
    #[OA\Get(
        path: '/api/home',
        summary: 'Dane do strony głównej: użytkownik i wydarzenia na +/- 7 dni',
        tags: ['home'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Zwraca dane o użytkowniku i wydarzeniach',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'user',
                            properties: [
                                new OA\Property(property: 'user_id', type: 'integer'),
                                new OA\Property(property: 'username', type: 'string'),
                                new OA\Property(property: 'points', type: 'integer'),
                                new OA\Property(property: 'role', type: 'string')
                            ],
                            type: 'object'
                        ),
                        new OA\Property(
                            property: 'events',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'id', type: 'integer'),
                                    new OA\Property(property: 'event_name', type: 'string'),
                                    new OA\Property(property: 'status_id', type: 'integer'),
                                    new OA\Property(property: 'event_date', type: 'string'),
                                    new OA\Property(property: 'home_odds', type: 'number'),
                                    new OA\Property(property: 'away_odds', type: 'number'),
                                    new OA\Property(property: 'draw_odds', type: 'number')
                                ],
                                type: 'object'
                            )
                        )
                    ],
                    type: 'object'
                )
            ),
            new OA\Response(response: 401, description: 'Brak autoryzacji'),
            new OA\Response(response: 404, description: 'Nie znaleziono użytkownika')
        ]
    )]
    public function home(SessionInterface $session, UserRepository $userRepository): JsonResponse
    {
        $userId = $session->get('user_id');
        if (!$userId) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $now = new \DateTime();
        $weekAgo = (clone $now)->modify('-7 days');
        $weekAhead = (clone $now)->modify('+7 days');

        $events = $this->eventRepository->getEventsInDateRange($weekAgo, $weekAhead);

        $eventsData = [];
        foreach ($events as $event) {
            $eventsData[] = [
                'id' => $event->getId(),
                'event_name' => $event->getEventName(),
                'status_id' => $event->getStatusId(),
                'event_date' => $event->getEventDate()->format('Y-m-d H:i:s'),
                'home_odds' => $event->getHomeOdds(),
                'away_odds' => $event->getAwayOdds(),
                'draw_odds' => $event->getDrawOdds(),
            ];
        }

        return $this->json([
            'user' => [
                'user_id' => $user->getId(),
                'username' => $user->getUsername(),
                'points' => $user->getPoints(),
                'role' => $user->getRole() ? $user->getRole()->getRoleName() : null,
            ],
            'events' => $eventsData,
        ]);
    }

    #[Route('/api/place-bet', name: 'place_bet', methods: ['POST'])]
    #[OA\Post(
        path: '/api/place-bet',
        summary: 'Postaw zakład na wydarzenie',
        tags: ['home'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['event_id', 'bet_amount', 'bet_choice'],
                properties: [
                    new OA\Property(property: 'event_id', type: 'integer'),
                    new OA\Property(property: 'bet_amount', type: 'integer'),
                    new OA\Property(property: 'bet_choice', type: 'string', description: 'home, away lub draw')
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Zakład postawiony',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'string'),
                        new OA\Property(property: 'potential_win', type: 'number')
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Brak autoryzacji'),
            new OA\Response(response: 404, description: 'Nie znaleziono użytkownika lub wydarzenia'),
            new OA\Response(response: 400, description: 'Za mało punktów lub niepoprawne dane')
        ]
    )]
    public function placeBet(Request $request, SessionInterface $session, EventRepository $eventRepository, UserRepository $userRepository): JsonResponse
    {
        $userId = $session->get('user_id');
        if (!$userId) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }
        $data = json_decode($request->getContent(), true);
        $eventId = $data['event_id'] ?? null;
        $betAmount = (int)($data['bet_amount'] ?? 0);
        $betChoice = $data['bet_choice'] ?? null;

        $event = $eventRepository->findOneBy(['id' => $eventId]);
        if (!$event) {
            return $this->json(['error' => 'Event not found'], 404);
        }

        if ($user->getPoints() < $betAmount) {
            return $this->json(['error' => 'Insufficient points for this bet'], 400);
        }

        $odds = match ($betChoice) {
            'home' => $event->getHomeOdds(),
            'away' => $event->getAwayOdds(),
            'draw' => $event->getDrawOdds(),
            default => 0,
        };

        $potentialWin = $betAmount * $odds;

        $bet = new Bet();
        $bet->setUser($user);
        $bet->setEvent($event);
        $bet->setBetAmount($betAmount);
        $bet->setBetChoice($betChoice);
        $bet->setPotentialWin($potentialWin);
        $bet->setBetDate(new \DateTime());

        $this->entityManager->persist($bet);

        $user->setPoints($user->getPoints() - $betAmount);
        $this->entityManager->persist($user);

        $this->entityManager->flush();

        return $this->json(['success' => 'Bet placed successfully', 'potential_win' => $potentialWin]);
    }

    #[Route('/api/logout', name: 'logout')]
    #[OA\Get(
        path: '/api/logout',
        summary: 'Wyloguj użytkownika',
        tags: ['home'],
        responses: [
            new OA\Response(response: 200, description: 'User logged out'),
        ]
    )]
    public function logout(SessionInterface $session): JsonResponse
    {
        $session->clear();
        return $this->json(['success' => 'User logged out successfully']);
    }
}