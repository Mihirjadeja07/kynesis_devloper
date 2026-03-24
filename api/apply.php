<?php

header('Content-Type: application/json');

require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);
    exit;
}

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody ?: '', true);

if (!is_array($payload)) {
    $payload = $_POST;
}

$name = trim($payload['name'] ?? '');
$email = trim($payload['email'] ?? '');
$role = trim($payload['role'] ?? '');
$github = trim($payload['github'] ?? '');
$skills = trim($payload['skills'] ?? '');

if ($name === '' || $email === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Name and Email are required.'
    ]);
    exit;
}

try {
    $pdo = getDatabaseConnection();
    initializeDatabase($pdo);

    $statement = $pdo->prepare(
        'INSERT INTO internship_applications (fullname, email, role, github_url, skills)
         VALUES (:fullname, :email, :role, :github_url, :skills)'
    );

    $statement->execute([
        ':fullname' => $name,
        ':email' => $email,
        ':role' => $role !== '' ? $role : null,
        ':github_url' => $github !== '' ? $github : null,
        ':skills' => $skills !== '' ? $skills : null,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Application logged to Kynesis Database.',
        'id' => (int) $pdo->lastInsertId()
    ]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed. Please verify XAMPP MySQL and your .env values.'
    ]);
}
