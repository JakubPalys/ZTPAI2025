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

    #[Route('/', name: 'index')]
    public function index(SessionInterface $session): JsonResponse
    {
        if (!$session->get('user')) {
            return $this->json(['error' => 'User not logged in'], 401);
        }
        return $this->json(['redirect' => $this->generateUrl('home')]);
    }

    #[Route('/home', name: 'home')]
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
                'event_date' => $event->getEventDate(),
                'status_id' => $event->getStatusId(),
                'event_date' => $event->getEventDate()->format('Y-m-d H:i:s'),
                'home_odds' => $event->getHomeOdds(),
                'away_odds' => $event->getAwayOdds(),
                'draw_odds' => $event->getDrawOdds(),
            ];
        }

        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'points' => $user->getPoints(),
            ],
            'events' => $eventsData,
        ]);
    }

    #[Route('/place-bet', name: 'place_bet', methods: ['POST'])]
    public function placeBet(Request $request, SessionInterface $session): JsonResponse
    {
        if (!$session->get('user')) {
            return $this->json(['error' => 'User not logged in'], 401);
        }

        $eventId = $request->request->get('event_id');
        $betAmount = (int) $request->request->get('bet_amount');
        $betChoice = $request->request->get('bet_choice');

        $user = $this->userRepository->findOneBy(['username' => $session->get('user')]);
        $event = $this->eventRepository->find($eventId);

        if (!$event || !$user) {
            return $this->json(['error' => 'Event or User not found'], 404);
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
        $bet->setPotentialWin($potentialWin);
        $this->entityManager->persist($bet);
        
        $user->setPoints($user->getPoints() - $betAmount);
        $this->entityManager->persist($user);
        
        $this->entityManager->flush();

        return $this->json(['success' => 'Bet placed successfully', 'potential_win' => $potentialWin]);
    }

    #[Route('/logout', name: 'logout')]
    public function logout(SessionInterface $session): JsonResponse
    {
        $session->clear();
        return $this->json(['success' => 'User logged out successfully']);
    }
}
