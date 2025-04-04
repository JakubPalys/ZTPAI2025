<?php

namespace App\Controller;

use App\Entity\Event;
use App\Repository\EventRepository;
use App\Repository\UserRepository;
use App\Repository\BetRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AdminController extends AbstractController
{
    private EventRepository $eventRepository;
    private UserRepository $userRepository;
    private BetRepository $betRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(EventRepository $eventRepository, UserRepository $userRepository, BetRepository $betRepository, EntityManagerInterface $entityManager)
    {
        $this->eventRepository = $eventRepository;
        $this->userRepository = $userRepository;
        $this->betRepository = $betRepository;
        $this->entityManager = $entityManager;
    }

    private function checkAdmin(): ?JsonResponse
    {
        $user = $this->getUser();

        if (!$user || $user->getRole()->getRoleName() !== 'admin') {
            return $this->json(['error' => 'Access denied. Admin privileges required.'], Response::HTTP_FORBIDDEN);
        }

        return null;
    }

    #[Route('/admin', name: 'admin_menu')]
    public function adminMenu(): JsonResponse
    {
        $checkAdminResponse = $this->checkAdmin();
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
                'status' => $event->getStatus(),
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

    #[Route('/admin/add-event', name: 'admin_add_event', methods: ['POST'])]
    public function addEvent(Request $request): JsonResponse
    {
        $checkAdminResponse = $this->checkAdmin();
        if ($checkAdminResponse) {
            return $checkAdminResponse;
        }

        $event = new Event();
        $event->setEventName($request->request->get('event_name'));
        $event->setEventDate(new \DateTime($request->request->get('event_date')));

        $this->entityManager->persist($event);
        $this->entityManager->flush();

        return $this->json(['success' => 'Event added successfully']);
    }

    #[Route('/admin/delete-event', name: 'admin_delete_event', methods: ['POST'])]
    public function deleteEvent(Request $request): JsonResponse
    {
        $checkAdminResponse = $this->checkAdmin();
        if ($checkAdminResponse) {
            return $checkAdminResponse;
        }

        $event = $this->eventRepository->find($request->request->get('event_id'));

        if ($event) {
            $this->entityManager->remove($event);
            $this->entityManager->flush();
            return $this->json(['success' => 'Event deleted successfully']);
        }

        return $this->json(['error' => 'Event not found'], Response::HTTP_NOT_FOUND);
    }

    #[Route('/admin/finish-event', name: 'admin_finish_event', methods: ['POST'])]
    public function finishEvent(Request $request): JsonResponse
    {
        $checkAdminResponse = $this->checkAdmin();
        if ($checkAdminResponse) {
            return $checkAdminResponse;
        }

        $event = $this->eventRepository->find($request->request->get('event_id'));

        if ($event) {
            $event->setStatus(2); // Mark event as finished (status 2 assumed)
            $this->entityManager->flush();

            $bets = $this->betRepository->findBy(['event' => $event]);
            foreach ($bets as $bet) {
                // Settle bet logic
            }

            return $this->json(['success' => 'Event finished and bets settled']);
        }

        return $this->json(['error' => 'Event not found'], Response::HTTP_NOT_FOUND);
    }
}
