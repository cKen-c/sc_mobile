<?php

namespace App\Repository;

use App\Entity\League;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<League>
 */
class LeagueRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, League::class);
    }

    public function findBySport(int $sportId): array
    {
        return $this->createQueryBuilder('l')
            ->andWhere('l.sport = :sportId')
            ->setParameter('sportId', $sportId)
            ->orderBy('l.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
