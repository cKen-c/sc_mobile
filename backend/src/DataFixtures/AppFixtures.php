<?php

namespace App\DataFixtures;

use App\Entity\League;
use App\Entity\Sport;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $passwordHasher) {}

    public function load(ObjectManager $manager): void
    {
        // ──── Admin User ────
        $admin = new User();
        $admin->setEmail('admin@scorecenter.fr');
        $admin->setUsername('Admin');
        $admin->setRoles(['ROLE_ADMIN']);
        $adminPass = $_ENV['FIXTURE_ADMIN_PASSWORD'] ?? 'Admin@SC2026!';
        $admin->setPassword($this->passwordHasher->hashPassword($admin, $adminPass));
        $manager->persist($admin);

        // ──── Test User (dev uniquement) ────
        $user = new User();
        $user->setEmail('user@scorecenter.fr');
        $user->setUsername('TestUser');
        $user->setRoles(['ROLE_USER']);
        $userPass = $_ENV['FIXTURE_USER_PASSWORD'] ?? 'User@SC2026!';
        $user->setPassword($this->passwordHasher->hashPassword($user, $userPass));
        $manager->persist($user);

        // ──── Sport : Football ────
        $football = new Sport();
        $football->setName('Football');
        $football->setSlug('football');
        $football->setIcon('⚽');
        $manager->persist($football);

        // ──── Ligues Football ────
        $leagues = [
            ['name' => 'Premier League', 'code' => 'PL', 'country' => 'Angleterre', 'externalId' => 2021],
            ['name' => 'La Liga', 'code' => 'PD', 'country' => 'Espagne', 'externalId' => 2014],
            ['name' => 'Ligue 1', 'code' => 'FL1', 'country' => 'France', 'externalId' => 2015],
        ];

        foreach ($leagues as $leagueData) {
            $league = new League();
            $league->setName($leagueData['name']);
            $league->setCode($leagueData['code']);
            $league->setCountry($leagueData['country']);
            $league->setExternalId($leagueData['externalId']);
            $league->setSport($football);
            $manager->persist($league);
        }

        $manager->flush();
    }
}
