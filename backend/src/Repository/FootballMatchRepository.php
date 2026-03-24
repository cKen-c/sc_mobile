<?php

namespace App\Repository;

use App\Entity\FootballMatch;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FootballMatch>
 */
class FootballMatchRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FootballMatch::class);
    }

    public function findByLeague(int $leagueId, ?string $status = null): array
    {
        $qb = $this->createQueryBuilder('m')
            ->andWhere('m.league = :leagueId')
            ->setParameter('leagueId', $leagueId)
            ->orderBy('m.utcDate', 'DESC');

        if ($status) {
            $qb->andWhere('m.status = :status')
                ->setParameter('status', $status);
        }

        return $qb->getQuery()->getResult();
    }

    public function findLiveMatches(): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.status IN (:statuses)')
            ->setParameter('statuses', ['LIVE', 'IN_PLAY', 'PAUSED'])
            ->orderBy('m.utcDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findTodayMatches(): array
    {
        $today = new \DateTime('today');
        $tomorrow = new \DateTime('tomorrow');

        return $this->createQueryBuilder('m')
            ->andWhere('m.utcDate >= :today')
            ->andWhere('m.utcDate < :tomorrow')
            ->setParameter('today', $today)
            ->setParameter('tomorrow', $tomorrow)
            ->orderBy('m.utcDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByExternalId(int $externalId): ?FootballMatch
    {
        return $this->findOneBy(['externalId' => $externalId]);
    }
}
