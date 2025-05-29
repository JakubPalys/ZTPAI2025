<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\UserRoleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class SecurityController extends AbstractController
{
    private UserRepository $userRepository;
    private UserRoleRepository $userRoleRepository;
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserRepository $userRepository, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher)
    {
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

#[Route('/api/login', name: 'login', methods: ['POST'])]
public function login(Request $request, SessionInterface $session, UserRepository $userRepository): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    if (!isset($data['email'], $data['password'])) {
        return $this->json(['error' => 'Invalid credentials'], 400);
    }

    $user = $userRepository->findOneBy(['email' => $data['email']]);
    if (!$user || !password_verify($data['password'], $user->getPasswordHash())) {
        return $this->json(['error' => 'Niepoprawne dane logowania'], 401);
    }

    $session->set('user_id', $user->getId());

    return $this->json(['message' => 'Logged in']);
}

#[Route('/api/register', name: 'register', methods: ['POST'])]
public function register(Request $request, EntityManagerInterface $em, UserRepository $userRepository, UserRoleRepository $userRoleRepository): JsonResponse
{
    try {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            return $this->json(['error' => 'Brakuje wymaganych danych'], 400);
        }

        if ($userRepository->findOneBy(['email' => $data['email']])) {
            return $this->json(['error' => 'Podany email jest już zajęty'], 409);
        }

        $user = new User();
        $user->setUsername($data['name']);
        $user->setEmail($data['email']);
        $user->setPasswordHash(password_hash($data['password'], PASSWORD_DEFAULT));
        $user->setPoints(1000);

        $role = $userRoleRepository->findOneBy(['role_name' => 'user']);
        if (!$role) {
            return $this->json(['error' => 'Nie znaleziono roli user'], 500);
        }
        $user->setRole($role);

        $em->persist($user);
        $em->flush();

        return $this->json([
            'message' => 'Użytkownik zarejestrowany',
            'user_id' => $user->getId()
        ], 201);

    } catch (\Throwable $e) {
        return $this->json(['error' => $e->getMessage()], 500);
    }
}

    
}
