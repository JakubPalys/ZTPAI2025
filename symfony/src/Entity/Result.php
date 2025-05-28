<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'bet_results')]
class Result
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'result_id', type: 'integer')]
    private int $id;

    #[ORM\Column(name: 'result_name', type: 'string', length: 50)]
    private string $resultName;

    public function getId(): int
    {
        return $this->id;
    }

    public function getResultName(): string
    {
        return $this->resultName;
    }

    public function setResultName(string $resultName): self
    {
        $this->resultName = $resultName;
        return $this;
    }
}