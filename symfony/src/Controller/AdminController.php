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

class AdminController extends AbstractController
{
    private EventRepository $eventRepository;
    private UserRepository $userRepository;
    private UserRoleRepository $userRoleRepository;
    private ResultRepository $resultRepository;
    private BetRepository $betRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(EventRepository $eventRepository, UserRepository $userRepository, BetRepository $betRepository, EntityManagerInterface $entityManager)
    {
        $this->eventRepository = $eventRepository;
        $this->userRepository = $userRepository;
        $this->betRepository = $betRepository;
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
        $pointsReturnedCount = 0;

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
public function finishEvent(Request $request, ResultRepository $resultRepository,SessionInterface $session): JsonResponse
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
}
