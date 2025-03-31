<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class SecurityController extends AbstractController
{
    private UserRepository $userRepository;
    private EntityManagerInterface $entityManager;
    private UserPasswordEncoderInterface $passwordEncoder;

    public function __construct(UserRepository $userRepository, EntityManagerInterface $entityManager, UserPasswordEncoderInterface $passwordEncoder)
    {
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        $this->passwordEncoder = $passwordEncoder;
    }

    #[Route('/login', name: 'app_login', methods: ['GET', 'POST'])]
    public function login(Request $request, SessionInterface $session): JsonResponse
    {
        if ($session->get('user')) {
            return $this->json(['redirect' => $this->generateUrl('home')]);
        }

        if ($request->isMethod('POST')) {
            $username = $request->request->get('username');
            $password = $request->request->get('password');
            
            $user = $this->userRepository->findOneBy(['username' => $username]);

            if ($user && $this->passwordEncoder->isPasswordValid($user, $password)) {
                $session->set('user', $user->getUsername());
                return $this->json(['success' => 'Login successful', 'redirect' => $this->generateUrl('home')]);
            }

            return $this->json(['error' => 'Invalid username or password'], 400);
        }

        return $this->json(['message' => 'Please provide credentials'], 400);
    }

    #[Route('/register', name: 'app_register', methods: ['GET', 'POST'])]
    public function register(Request $request, SessionInterface $session): JsonResponse
    {
        if ($session->get('user')) {
            return $this->json(['redirect' => $this->generateUrl('home')]);
        }

        if ($request->isMethod('POST')) {
            $username = $request->request->get('username');
            $email = $request->request->get('email');
            $password = $request->request->get('password');
            $confirmPassword = $request->request->get('confirm_password');

            if ($password !== $confirmPassword) {
                return $this->json(['error' => 'Passwords must match'], 400);
            }

            if ($this->userRepository->findOneBy(['username' => $username])) {
                return $this->json(['error' => 'Username is already taken'], 400);
            }

            $user = new User();
            $user->setUsername($username);
            $user->setEmail($email);
            $user->setPasswordHash($this->passwordEncoder->encodePassword($user, $password));
            $user->setPoints(1000);

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            return $this->json(['success' => 'Registration successful', 'redirect' => $this->generateUrl('app_login')]);
        }

        return $this->json(['message' => 'Please provide registration details'], 400);
    }
}
