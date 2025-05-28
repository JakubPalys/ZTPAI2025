<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\BetRepository;
use App\Repository\UserRepository;
use App\Repository\EventRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class ProfileController extends AbstractController
{
    private UserRepository $userRepository;
    private BetRepository $betRepository;
    private EventRepository $eventRepository;
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        UserRepository $userRepository,
        BetRepository $betRepository,
        EventRepository $eventRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->eventRepository = $eventRepository;
        $this->userRepository = $userRepository;
        $this->betRepository = $betRepository;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

    #[Route('/api/profile', name: 'profile')]
public function profile(SessionInterface $session): JsonResponse
{
    $userId = $session->get('user_id');
    if (!$userId) {
        return $this->json(['error' => 'User not authenticated'], 401);
    }

    $user = $this->userRepository->find($userId);
    if (!$user) {
        return $this->json(['error' => 'User not found'], 404);
    }

    $activeBetsRaw = $this->betRepository->getSortedBetsByUser($user->getId(), 1);
    $completedBetsRaw = $this->betRepository->getSortedBetsByUser($user->getId(), 2);

    $flatten = function(array $betsRaw) {
        $result = [];
        foreach ($betsRaw as $row) {
            $bet = $row[0];
            $bet['event_name'] = $row['event_name'];
            $result[] = $bet;
        }
        return $result;
    };

    $activeBets = $flatten($activeBetsRaw);
    $completedBets = $flatten($completedBetsRaw);

    return $this->json([
        'user' => [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'points' => $user->getPoints(),
        ],
        'activeBets' => $activeBets,
        'completedBets' => $completedBets
    ]);
}

   #[Route('/api/profile/change-password', name: 'change_password', methods: ['POST'])]
public function changePassword(Request $request, SessionInterface $session): JsonResponse
{
    $userId = $session->get('user_id');
    if (!$userId) {
        return $this->json(['error' => 'User not authenticated'], 401);
    }

    $user = $this->userRepository->find($userId);
    if (!$user) {
        return $this->json(['error' => 'User not found'], 404);
    }

    $data = json_decode($request->getContent(), true);

    $oldPassword = $data['old_password'] ?? null;
    $newPassword = $data['new_password'] ?? null;
    $confirmPassword = $data['confirm_password'] ?? null;

    if (!password_verify($oldPassword, $user->getPasswordHash())) {
        return $this->json(['error' => 'Old password is incorrect'], 400);
    }

    if ($newPassword !== $confirmPassword) {
        return $this->json(['error' => 'Passwords do not match'], 400);
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $user->setPasswordHash($hashedPassword);
    $this->entityManager->flush();

    return $this->json(['success' => 'Password changed successfully']);
}

    #[Route('/api/profile/delete', name: 'delete_account', methods: ['POST'])]
    public function deleteAccount(SessionInterface $session): JsonResponse
    {
        $userId = $session->get('user_id');
        if (!$userId) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        $user = $this->userRepository->find($userId);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $this->betRepository->deleteBetsByUserId($user->getId());
        $this->entityManager->remove($user);
        $this->entityManager->flush();

        $session->invalidate();

        return $this->json(['success' => 'Account deleted successfully']);
    }
}