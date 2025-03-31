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
    public function index(SessionInterface $session): Response
    {
        if (!$session->get('user')) {
            return $this->json(['error' => 'User not logged in'], Response::HTTP_UNAUTHORIZED);
        }
        return $this->json(['redirect' => $this->generateUrl('home')]);
    }

    #[Route('/home', name: 'home')]
    public function home(SessionInterface $session): Response
    {
        if (!$session->get('user')) {
            return $this->json(['error' => 'User not logged in'], Response::HTTP_UNAUTHORIZED);
        }

        $user = $this->userRepository->findOneBy(['username' => $session->get('user')]);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $events = $this->eventRepository->findBy(['event_date' => new \DateTime()], ['event_date' => 'ASC']);
        
        $eventsData = [];
        foreach ($events as $event) {
            $eventsData[] = [
                'id' => $event->getId(),
                'home_team' => $event->getHomeTeam(),
                'away_team' => $event->getAwayTeam(),
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
    public function placeBet(Request $request, SessionInterface $session): Response
    {
        if (!$session->get('user')) {
            return $this->json(['error' => 'User not logged in'], Response::HTTP_UNAUTHORIZED);
        }

        $eventId = $request->request->get('event_id');
        $betAmount = (int) $request->request->get('bet_amount');
        $betChoice = $request->request->get('bet_choice');

        $user = $this->userRepository->findOneBy(['username' => $session->get('user')]);
        $event = $this->eventRepository->find($eventId);

        if (!$event || !$user) {
            return $this->json(['error' => 'Event or User not found'], Response::HTTP_NOT_FOUND);
        }

        if ($user->getPoints() < $betAmount) {
            return $this->json(['error' => 'Insufficient points for this bet'], Response::HTTP_BAD_REQUEST);
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
    public function logout(SessionInterface $session): Response
    {
        $session->clear();
        return $this->json(['success' => 'User logged out successfully']);
    }
}
