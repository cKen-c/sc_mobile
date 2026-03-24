<?php

namespace App\Repository;

use App\Entity\FavoriteTeam;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FavoriteTeam>
 */
class FavoriteTeamRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FavoriteTeam::class);
    }

    public function findByUser(int $userId): array
    {
        return $this->createQueryBuilder('f')
            ->where('f.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('f.teamName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByUserAndTeam(int $userId, int $teamApiId): ?FavoriteTeam
    {
        return $this->createQueryBuilder('f')
            ->where('f.user = :userId')
            ->andWhere('f.teamApiId = :teamApiId')
            ->setParameter('userId', $userId)
            ->setParameter('teamApiId', $teamApiId)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
