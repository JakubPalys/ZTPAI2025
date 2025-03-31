<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\BetRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
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

    #[Route('/profile', name: 'profile')]
    public function profile(Security $security): Response
    {
        $user = $security->getUser();
        if (!$user) {
            return $this->redirectToRoute('app_login');
        }

        $activeBets = $this->betRepository->getSortedBetsByUser($user->getId(), 'active');
        $completedBets = $this->betRepository->getSortedBetsByUser($user->getId(), 'completed');

        return $this->render('profile/profile.html.twig', [
            'user' => $user,
            'activeBets' => $activeBets,
            'completedBets' => $completedBets
        ]);
    }

    #[Route('/profile/change-password', name: 'change_password', methods: ['POST'])]
    public function changePassword(Request $request, Security $security): Response
    {
        $user = $security->getUser();
        if (!$user) {
            return $this->redirectToRoute('app_login');
        }

        $oldPassword = $request->request->get('old_password');
        $newPassword = $request->request->get('new_password');
        $confirmPassword = $request->request->get('confirm_password');

        if (!$this->passwordHasher->isPasswordValid($user, $oldPassword)) {
            $this->addFlash('error', 'Stare hasło jest niepoprawne.');
            return $this->redirectToRoute('profile');
        }

        if ($newPassword !== $confirmPassword) {
            $this->addFlash('error', 'Hasła nie są takie same.');
            return $this->redirectToRoute('profile');
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
        $user->setPasswordHash($hashedPassword);
        $this->entityManager->flush();

        $this->addFlash('success', 'Hasło zmienione!');
        return $this->redirectToRoute('profile');
    }

    #[Route('/profile/delete', name: 'delete_account', methods: ['POST'])]
    public function deleteAccount(Security $security): Response
    {
        $user = $security->getUser();
        if (!$user) {
            return $this->redirectToRoute('app_login');
        }

        $this->betRepository->deleteBetsByUserId($user->getId());
        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return $this->redirectToRoute('app_logout');
    }
}
