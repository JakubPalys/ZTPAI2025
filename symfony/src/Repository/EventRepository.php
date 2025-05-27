<?php

namespace App\Repository;

use App\Entity\Event;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class EventRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Event::class);
    }

    public function getEventsInDateRange(\DateTime $from, \DateTime $to): array
    {
    return $this->createQueryBuilder('e')
        ->where('e.eventDate BETWEEN :from AND :to')
        ->andWhere('e.statusId = :status')
        ->setParameter('from', $from)
        ->setParameter('to', $to)
        ->setParameter('status', 1)
        ->orderBy('e.eventDate', 'ASC')
        ->getQuery()
        ->getResult();
    }
}
