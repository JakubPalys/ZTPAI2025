<?php

namespace App\Repository;

use App\Entity\Bet;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class BetRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Bet::class);
    }

   public function getSortedBetsByUser(int $userId, int $statusId): array
{
    return $this->createQueryBuilder('b')
        ->select('b', 'e.eventName AS event_name')
        ->innerJoin('b.event', 'e')
        ->andWhere('b.user = :userId')
        ->andWhere('e.statusId = :statusId')
        ->setParameter('userId', $userId)
        ->setParameter('statusId', $statusId)
        ->orderBy('b.bet_date', 'DESC')
        ->getQuery()
        ->getArrayResult();
}
}
