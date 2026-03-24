<?php

namespace App\Service;

use App\Entity\ApiCache;
use App\Repository\ApiCacheRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class FootballApiService
{
    private string $apiKey;
    private string $apiUrl;

    // TTL en secondes selon le type de données
    private const TTL_LIVE_MATCHES = 60;       // 1 minute  — scores en direct
    private const TTL_MATCHES      = 300;      // 5 minutes — liste de matchs
    private const TTL_STANDINGS    = 600;      // 10 minutes
    private const TTL_SCORERS      = 1800;     // 30 minutes
    private const TTL_TEAMS        = 3600;     // 1 heure
    private const TTL_PERSONS      = 3600;     // 1 heure
    private const TTL_COMPETITIONS = 86400;    // 24 heures
    private const TTL_HEAD2HEAD    = 1800;     // 30 minutes
    private const TTL_DEFAULT      = 300;      // 5 minutes

    public function __construct(
        private HttpClientInterface $httpClient,
        private EntityManagerInterface $entityManager,
        private ApiCacheRepository $apiCacheRepository,
        string $footballApiKey,
        string $footballApiUrl,
    ) {
        $this->apiKey = $footballApiKey;
        $this->apiUrl = $footballApiUrl;
    }

    /**
     * Détermine le TTL approprié en fonction de l'endpoint.
     */
    private function getTtl(string $endpoint): int
    {
        if (str_contains($endpoint, '/head2head')) {
            return self::TTL_HEAD2HEAD;
        }
        if ($endpoint === '/matches' || str_contains($endpoint, '/matches/')) {
            return self::TTL_LIVE_MATCHES;
        }
        if (str_ends_with($endpoint, '/matches')) {
            return self::TTL_MATCHES;
        }
        if (str_contains($endpoint, '/standings')) {
            return self::TTL_STANDINGS;
        }
        if (str_contains($endpoint, '/scorers')) {
            return self::TTL_SCORERS;
        }
        if (str_contains($endpoint, '/teams')) {
            return self::TTL_TEAMS;
        }
        if (str_contains($endpoint, '/persons')) {
            return self::TTL_PERSONS;
        }
        if (str_starts_with($endpoint, '/competitions')) {
            return self::TTL_COMPETITIONS;
        }

        return self::TTL_DEFAULT;
    }

    private function request(string $endpoint, array $params = []): array
    {
        // Générer une clé de cache unique
        $cacheKey = hash('sha256', $endpoint . '|' . json_encode($params));

        // Vérifier le cache
        $cached = $this->apiCacheRepository->findValidCache($cacheKey);
        if ($cached) {
            return json_decode($cached->getResponseData(), true);
        }

        // Appel API
        $response = $this->httpClient->request('GET', $this->apiUrl . $endpoint, [
            'headers' => [
                'X-Auth-Token' => $this->apiKey,
            ],
            'query' => $params,
        ]);

        $data = $response->toArray();

        // Stocker en cache
        $ttl = $this->getTtl($endpoint);
        $now = new \DateTimeImmutable();

        // Upsert : mettre à jour si la clé existe déjà (expirée)
        $existing = $this->apiCacheRepository->findOneBy(['cacheKey' => $cacheKey]);
        $cache = $existing ?? new ApiCache();
        $cache->setCacheKey($cacheKey);
        $cache->setEndpoint($endpoint);
        $cache->setResponseData(json_encode($data));
        $cache->setCreatedAt($now);
        $cache->setExpiresAt($now->modify('+' . $ttl . ' seconds'));

        $this->entityManager->persist($cache);
        $this->entityManager->flush();

        return $data;
    }

    // ──── Competitions ────

    public function getCompetitions(): array
    {
        return $this->request('/competitions');
    }

    public function getCompetition(string $code): array
    {
        return $this->request('/competitions/' . $code);
    }

    // ──── Standings ────

    public function getStandings(string $competitionCode, ?int $matchday = null, ?int $season = null): array
    {
        $params = [];
        if ($matchday) $params['matchday'] = $matchday;
        if ($season) $params['season'] = $season;

        return $this->request('/competitions/' . $competitionCode . '/standings', $params);
    }

    // ──── Matches ────

    public function getCompetitionMatches(string $competitionCode, array $filters = []): array
    {
        return $this->request('/competitions/' . $competitionCode . '/matches', $filters);
    }

    public function getMatch(int $matchId): array
    {
        return $this->request('/matches/' . $matchId);
    }

    public function getTodayMatches(?string $competitions = null): array
    {
        $params = [];
        if ($competitions) $params['competitions'] = $competitions;
        return $this->request('/matches', $params);
    }

    // ──── Teams ────

    public function getCompetitionTeams(string $competitionCode, ?int $season = null): array
    {
        $params = [];
        if ($season) $params['season'] = $season;
        return $this->request('/competitions/' . $competitionCode . '/teams', $params);
    }

    public function getTeam(int $teamId): array
    {
        return $this->request('/teams/' . $teamId);
    }

    public function getTeamMatches(int $teamId, array $filters = []): array
    {
        return $this->request('/teams/' . $teamId . '/matches', $filters);
    }

    // ──── Scorers ────

    public function getScorers(string $competitionCode, ?int $limit = 10, ?int $season = null): array
    {
        $params = ['limit' => $limit];
        if ($season) $params['season'] = $season;
        return $this->request('/competitions/' . $competitionCode . '/scorers', $params);
    }

    // ──── Person ────

    public function getPerson(int $personId): array
    {
        return $this->request('/persons/' . $personId);
    }

    // ──── Head to Head ────

    public function getHead2Head(int $matchId, ?int $limit = 10): array
    {
        return $this->request('/matches/' . $matchId . '/head2head', ['limit' => $limit]);
    }
}
