<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'events')]
class Event
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'event_id', type: 'integer')]
    private int $id;

    #[ORM\Column(name: 'event_name', type: 'string', length: 255)]
    private string $eventName;

    #[ORM\Column(name: 'event_date', type: 'datetime')]
    private \DateTime $eventDate;

    #[ORM\Column(name: 'status_id', type: 'integer')]
    private int $statusId;

    #[ORM\Column(name: 'home_odds', type: 'float')]
    private float $homeOdds;

    #[ORM\Column(name: 'away_odds', type: 'float')]
    private float $awayOdds;

    #[ORM\Column(name: 'draw_odds', type: 'float')]
    private float $drawOdds;

    #[ORM\ManyToOne(targetEntity: Result::class)]
    #[ORM\JoinColumn(name: "result_id", referencedColumnName: "result_id", nullable: true)]
    private ?Result $result = null;

    public function getId(): int
    {
        return $this->id;
    }

    public function getEventName(): string
    {
        return $this->eventName;
    }

    public function setEventName(string $eventName): self
    {
        $this->eventName = $eventName;
        return $this;
    }

    public function getEventDate(): \DateTime
    {
        return $this->eventDate;
    }

    public function setEventDate(\DateTime $eventDate): self
    {
        $this->eventDate = $eventDate;
        return $this;
    }

    public function getStatusId(): int
    {
        return $this->statusId;
    }

    public function setStatusId(int $statusId): self
    {
        $this->statusId = $statusId;
        return $this;
    }

    public function getHomeOdds(): float
    {
        return $this->homeOdds;
    }

    public function setHomeOdds(float $homeOdds): self
    {
        $this->homeOdds = $homeOdds;
        return $this;
    }

    public function getAwayOdds(): float
    {
        return $this->awayOdds;
    }

    public function setAwayOdds(float $awayOdds): self
    {
        $this->awayOdds = $awayOdds;
        return $this;
    }

    public function getDrawOdds(): float
    {
        return $this->drawOdds;
    }

    public function setDrawOdds(float $drawOdds): self
    {
        $this->drawOdds = $drawOdds;
        return $this;
    }

    public function getResult(): ?Result
    {
        return $this->result;
    }

    public function setResult(?Result $result): self
    {
        $this->result = $result;
        return $this;
    }

}
