<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'events')]
class Event
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private int $event_id;

    #[ORM\Column(type: 'string', length: 255)]
    private string $event_name;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $event_date;
}