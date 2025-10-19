<?php

namespace App\WebSocket;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class WebSocket implements MessageComponentInterface
{
    protected \SplObjectStorage $clients;
    private array $rooms;
    private int $open_room;
    private array $win_combination;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
        $this->rooms = [];
        $this->open_room = 0;
        $this->win_combination = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
    }

    private function checkIssetArray(int $room): void
    {
        if (!isset($this->rooms[$room]['players'])) {
            $this->rooms[$room]['players'] = [];
        }

        if (!isset($this->rooms[$room]['clicked_sections'])) {
            $this->rooms[$room]['clicked_sections'] = [];
        }

        if (!isset($this->rooms[$room]['reset'])) {
            $this->rooms[$room]['reset'] = 0;
        }

        if (!isset($this->rooms[$room]['first'])) {
            $this->rooms[$room]['first'] = 0;
        }
    }

    public function searchInRooms(int $id): int
    {
        $room = 0;

        for ($i = 0; $i < count($this->rooms); $i++) {
            if (array_key_exists($id, $this->rooms[$i]['players'])) {
                $room = $i;
                break;
            }
        }

        return $room;
    }

    public function onOpen(ConnectionInterface $conn): void
    {
        $this->checkIssetArray($this->open_room);

        if (count($this->rooms[$this->open_room]['players']) === 2) {
            $this->open_room++;
        }

        $this->rooms[$this->open_room]['players'][$conn->resourceId] = [];

        $this->clients->attach($conn);

        echo "Connect: " . count($this->clients) . "\n";
    }

    public function onMessage(ConnectionInterface $from, $msg): void
    {
        $data = json_decode($msg, true);

        $id = $from->resourceId;

        $room = $this->searchInRooms($id);

        for ($i = 0; $i < count($this->rooms); $i++) {
            if (array_key_exists($id, $this->rooms[$i]['players'])) {
                $room = $i;
                break;
            }
        }

        $this->checkIssetArray($room);

        switch ($data['type']) {
            case 'custom_battle':
                $custom_room = random_int(1000, 9999);

                $this->rooms[$this->open_room]['code'] = $custom_room;

                $from->send(json_encode([
                    'type' => 'custom_battle',
                    'code' => $custom_room,
                ]));

                break;
            case 'code':
                unset($this->rooms[$this->open_room]['players'][$id]);

                $code = $data['code'];

                for ($i = 0; $i < count($this->rooms); $i++) {
                    if (in_array($code, $this->rooms[$i])) {
                        $this->rooms[$i]['players'][$id] = [];
                    }
                }

                break;
            case 'userinfo':
                $username = $data['username'];

                $char = count($this->rooms[$room]['players']) === 1 ? 'x' : 'o';
                $canStep = $char === 'x';

                $playerData = [
                    'username' => $username,
                    'char' => $char,
                    'canStep' => $canStep,
                ];

                $this->rooms[$this->open_room]['players'][$id] = $playerData;


                if (count($this->rooms[$room]['players']) === 2) {
                    foreach ($this->clients as $client) {
                        if (array_key_exists($client->resourceId, $this->rooms[$room]['players'])) {
                            $client->send(json_encode([
                                'players' => array_values($this->rooms[$room]['players']),
                                'canStart' => true,
                                'reset' => true
                            ]));
                        }
                    }
                }
                break;

            case 'wont-reset':
                $this->rooms[$room]['reset']++;
                $reset = $this->rooms[$room]['reset'];

                if ($reset >= 2) {
                    $this->rooms[$room]['reset'] = 0;
                    $this->rooms[$room]['clicked_sections'] = [];

                    if ($this->rooms[$room]['first'] === 0) {
                        $this->rooms[$room]['first'] = 1;
                    } else {
                        $this->rooms[$room]['first'] = 0;
                    }

                    for ($i = 0; $i < 2; $i++) {
                        $keys = array_keys($this->rooms[$room]['players']);

                        $currentPlayer =& $this->rooms[$room]['players'][$keys[$i]];

                        $currentPlayer['canStep'] = !$currentPlayer['canStep'];
                        if ($currentPlayer['char'] === 'x') {
                            $currentPlayer['char'] = 'o';
                            $currentPlayer['canStep'] = false;
                        } else {
                            $currentPlayer['char'] = 'x';
                            $currentPlayer['canStep'] = true;
                        }
                    }

                    foreach ($this->clients as $client) {
                        if (array_key_exists($client->resourceId, $this->rooms[$room]['players'])) {
                            $client->send(json_encode([
                                'reset' => true,
                                'players' => array_values($this->rooms[$room]['players']),
                                'canStart' => true,
                            ]));
                        }
                    }
                }
                break;

            case 'clicked':
                if (!in_array($data['section'], $this->rooms[$room]['clicked_sections'])) {
                    $this->rooms[$room]['clicked_sections'][] = $data['section'];
                }

                foreach ($this->clients as $client) {
                    if (array_key_exists($client->resourceId, $this->rooms[$room]['players'])) {
                        $client->send(json_encode([
                            'section' => $data['section'],
                            'clicked_sections' => $this->rooms[$room]['clicked_sections'],
                            'currentChar' => $data['currentChar'],
                        ]));
                    }
                }

                $keys = array_keys($this->rooms[$room]['players']);

                $user_data =& $this->rooms[$room]['players'];

                $i = 0;
                foreach ($this->clients as $client) {
                    if (array_key_exists($client->resourceId, $this->rooms[$room]['players'])) {
                        $user =& $user_data[$keys[$i]];
                        $user['canStep'] = !$user['canStep'];
                        $client->send(json_encode([
                            'type' => 'canStep',
                            'canStep' => $user['canStep'],
                        ]));
                        $i++;
                    }
                }

//----------------------------------CheckWinner---------------------------
                $first = '';
                $second = '';

                foreach ($this->rooms[$room]['players'] as $player) {
                    if ($player['char'] === 'x') {
                        $first = $player['username'];
                    } else {
                        $second = $player['username'];
                    }
                }


                $first_player_combination['username'] = $first;
                $second_player_combination['username'] = $second;

                $first_player_combination['sections'] = [];
                $second_player_combination['sections'] = [];

                $winner = false;
                $player_win = '';


                foreach ($this->rooms[$room]['clicked_sections'] as $section) {
                    if ($section['char'] === 'x') {
                        $first_player_combination['sections'][] = $section['id'];
                    } else {
                        $second_player_combination['sections'][] = $section['id'];
                    }
                }

                foreach ($this->win_combination as $combination) {
                    [$a, $b, $c] = $combination;
                    if (
                        in_array($a, $first_player_combination['sections']) &&
                        in_array($b, $first_player_combination['sections']) &&
                        in_array($c, $first_player_combination['sections'])
                    )
                    {
                        $winner = true;
                        $player_win = $first_player_combination['username'];
                        break;
                    }

                    if (
                        in_array($a, $second_player_combination['sections']) &&
                        in_array($b, $second_player_combination['sections']) &&
                        in_array($c, $second_player_combination['sections'])
                    ) {
                        $winner = true;
                        $player_win = $second_player_combination['username'];
                        break;
                    }
                }

                if ($winner === true) {
                    foreach ($this->clients as $client) {
                        if (array_key_exists($client->resourceId, $this->rooms[$room]['players'])) {
                            $client->send(json_encode([
                                'winner' => true,
                                'player_winner' => $player_win,
                            ]));
                        }
                    }
                }

                break;
        }
    }

    public function onClose(ConnectionInterface $conn): void
    {
        $room = $this->searchInRooms($conn->resourceId);

        foreach ($this->clients as $client) {
            if (array_key_exists($client->resourceId, $this->rooms[$room]['players'])) {
                $client->close();
            }
        }

        unset($this->rooms[$room]['players'][$conn->resourceId]);

        if (count($this->rooms[$room]['players']) === 0) {
            unset($this->rooms[$room]);

            if (isset($this->rooms[$this->open_room])) {
                if (!$this->rooms[$this->open_room] == 0) $this->open_room--;
            }
        }

        $this->clients->detach($conn);
        echo "Disconnect:" . count($this->clients) . "\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e): void
    {
        $this->clients->detach($conn);
    }
}

//                ----------Helper Structure----------
//                $this->rooms = [
//                    0 => [
//                        'players' => [
//                            43 => [
//                                'username' => 'Adam',
//                                'char' => 'o',
//                                'canStep' => false,
//                            ],
//                            44 => [
//                                'username' => '2342342',
//                                'char' => 'x',
//                                'canStep' => true,
//                            ]
//                        ],
//                        'clicked_sections' => [
//                            0 => [
//                                'username' => 'Adam',
//                                'index' => 4
//                            ],
//                            1 => [
//                                'username' => 'Anna',
//                                'index' => 6
//                            ],
//                            2 => [
//                                'username' => 'John',
//                                'index' => 1
//                            ]
//                        ],
//                        'reset' => 0,
//                        'first' => 0,
//                    ],
//                    1 => [
//                        'players' => [
//                            43 => [
//                                'username' => 'Adam',
//                                'char' => 'o',
//                                'canStep' => false,
//                            ],
//                            44 => [
//                                'username' => '2342342',
//                                'char' => 'x',
//                                'canStep' => true,
//                            ]
//                        ],
//                        'clicked_sections' => [
//                            0 => [
//                                'username' => 'Adam',
//                                'index' => 4
//                            ],
//                            1 => [
//                                'username' => 'Anna',
//                                'index' => 6
//                            ],
//                            2 => [
//                                'username' => 'John',
//                                'index' => 1
//                            ]
//                        ],
//                        'reset' => 0,
//                        'first' => 0,
//                    ]
//                ];