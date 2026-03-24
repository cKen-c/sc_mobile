<?php

namespace App\Repository;

use App\Entity\ApiCache;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ApiCache>
 */
class ApiCacheRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ApiCache::class);
    }

    /**
     * Trouve une entrée de cache valide (non expirée) par sa clé.
     */
    public function findValidCache(string $cacheKey): ?ApiCache
    {
        return $this->createQueryBuilder('c')
            ->where('c.cacheKey = :key')
            ->andWhere('c.expiresAt > :now')
            ->setParameter('key', $cacheKey)
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Supprime les entrées expirées.
     */
    public function purgeExpired(): int
    {
        return $this->createQueryBuilder('c')
            ->delete()
            ->where('c.expiresAt < :now')
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->execute();
    }
}
