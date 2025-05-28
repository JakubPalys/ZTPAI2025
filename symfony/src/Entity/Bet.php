<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\BetRepository;

#[ORM\Entity(repositoryClass: BetRepository::class)]
#[ORM\Table(name: 'bets')]
class Bet
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private ?int $bet_id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: "user_id", referencedColumnName: "user_id", nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Event::class)]
    #[ORM\JoinColumn(name: "event_id", referencedColumnName: "event_id", nullable: false)]
    private ?Event $event = null;

    #[ORM\Column(type: "integer")]
    private int $bet_amount;

    #[ORM\Column(type: "string", length: 10)]
    private string $bet_choice;

    #[ORM\Column(type: "datetime")]
    private \DateTimeInterface $bet_date;

    #[ORM\Column(type: "float")]
    private float $potential_win;


    public function getBetId(): ?int
    {
        return $this->bet_id;
    }

    public function setBetId(int $bet_id): self
    {
        $this->bet_id = $bet_id;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;
        return $this;
    }

    public function getEvent(): ?Event
    {
        return $this->event;
    }

    public function setEvent(?Event $event): self
    {
        $this->event = $event;
        return $this;
    }

    public function getBetAmount(): int
    {
        return $this->bet_amount;
    }

    public function setBetAmount(int $bet_amount): self
    {
        $this->bet_amount = $bet_amount;
        return $this;
    }

    public function getBetChoice(): string
    {
        return $this->bet_choice;
    }

    public function setBetChoice(string $bet_choice): self
    {
        $this->bet_choice = $bet_choice;
        return $this;
    }

    public function getBetDate(): \DateTimeInterface
    {
        return $this->bet_date;
    }

    public function setBetDate(\DateTimeInterface $bet_date): self
    {
        $this->bet_date = $bet_date;
        return $this;
    }

    public function getPotentialWin(): float
    {
        return $this->potential_win;
    }

    public function setPotentialWin(float $potential_win): self
    {
        $this->potential_win = $potential_win;
        return $this;
    }
}