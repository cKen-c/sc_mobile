<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class ApiStatusController
{
    #[Route('/api', name: 'api_status', methods: ['GET'])]
    public function status(): JsonResponse
    {
        return new JsonResponse(['status' => 'API is running']);
    }
}
