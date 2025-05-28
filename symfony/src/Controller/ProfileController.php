<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\BetRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class ProfileController extends AbstractController
{
    private UserRepository $userRepository;
    private BetRepository $betRepository;
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        UserRepository $userRepository,
        BetRepository $betRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->userRepository = $userRepository;
        $this->betRepository = $betRepository;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

    #[Route('/api/profile', name: 'profile')]
    public function profile(Security $security): JsonResponse
    {
        $user = $security->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        $activeBets = $this->betRepository->getSortedBetsByUser($user->getId(), 'active');
        $completedBets = $this->betRepository->getSortedBetsByUser($user->getId(), 'completed');

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
    public function changePassword(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }
    
        $oldPassword = $request->request->get('old_password');
        $newPassword = $request->request->get('new_password');
        $confirmPassword = $request->request->get('confirm_password');
    
        if (!$this->passwordHasher->isPasswordValid($user, $oldPassword)) {
            return $this->json(['error' => 'Old password is incorrect'], 400);
        }
    
        if ($newPassword !== $confirmPassword) {
            return $this->json(['error' => 'Passwords do not match'], 400);
        }
    
        $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);
        $this->entityManager->flush();
    
        return $this->json(['success' => 'Password changed successfully']);
    }
    

    #[Route('/api/profile/delete', name: 'delete_account', methods: ['POST'])]
    public function deleteAccount(Security $security): JsonResponse
    {
        $user = $security->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        $this->betRepository->deleteBetsByUserId($user->getId());
        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return $this->json(['success' => 'Account deleted successfully']);
    }
}
