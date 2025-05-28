<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'user_roles')]
class UserRole
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private int $role_id;

    #[ORM\Column(type: 'string', length: 50, unique: true)]
    private string $role_name;
    
    public function getId(): int
    {
        return $this->role_id;
    }

    public function getRoleName(): string
    {
        return $this->role_name;
    }

    public function setRoleName(string $role_name): self
    {
        $this->role_name = $role_name;
        return $this;
    }
}