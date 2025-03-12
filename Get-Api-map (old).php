<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

    $truckConfig = [
        'truckSmall' => [
            'fuelRate' => 35,
            'divisor' => 10,
            'maintanance' => 1,
            'fixcost' => [
                'smalltrans' => 2500,
                'Tech' => 800,
                'TechAssist' => 550,
            ],
            'allowances' => [200, 500, 700, 1200, 1700, 2200], 
            'TechAllowance' => [200, 200, 200, 850, 950, 1050, 1150],
            'AssistTechAllowance' => [150, 150, 150, 750, 800, 900, 1000],
        ],
        'single_rolloff' => [
            'fuelRate' => 35,
            'divisor' => 2.7,
            'maintanance' => 3.74,
            'fixcost' => [
                'bigtrans' => 4200,
                'Driver' => 600,
                'Assist' => 550,
            ],
            'allowances' => [200, 500, 700, 1200, 1700, 2200],
                'Allowance' => [300, 350, 400, 1100, 1200, 1400, 1700],
                'AssistAllowance' => [200, 200, 200, 750, 850, 950, 1050],
            ],
          'trailer_rolloff' => [
                        'fuelRate' => 35,
                        'divisor' => 2.7,
                        'maintanance' => 3.74,
                        'fixcost' => [
                        'bigtrans' => 4200,
                        'Driver' => 600,
                        'Assist' => 550
                            ],
                           'allowances' => [200, 500, 700, 1200, 1700, 2200], 
                            'Allowance' => [450, 500, 550, 1500, 1650, 1950, 2450],
                            'AssistAllowance' => [200, 200, 200, 750, 850, 950, 1050]
                        ],
                        'single_vacuum' =>[
                            'fuelRate' =>35,
                            'divisor' =>2.6,
                            'maintanance' => 3.74,
                            'fixcost' =>[
                             'bigtrans' => 4200,
                             'Driver' =>600,
                             'Assist' =>550
                            ],
                            'allowances' =>[200, 500, 700, 1200, 1700, 2200], 
                             'Allowance' =>[400, 450, 500, 1300, 1400, 1600, 1900],
                             'AssistAllowance' =>[250, 250, 250, 850, 950, 1050, 1150]
                           ],
                      
                           'trailer_vacuum' =>[
                            'fuelRate' =>35,
                            'divisor' =>2.6,
                            'maintanance' => 3.74,
                            'fixcost' =>[
                             'bigtrans' =>4200,
                             'Driver' =>600,
                             'Assist' =>550
                            ],
                            'allowances' =>[200, 500, 700, 1200, 1700, 2200],
                             'Allowance' =>[600, 650, 700, 1800, 1950, 2250, 2750],
                             'AssistAllowance' =>[250, 250, 250, 850, 950, 1050, 1150]
                           ],
                      
                           'single_crane' =>[
                            'fuelRate' =>35,
                            'divisor' =>2.6,
                            'maintanance' => 3.74,
                            'fixcost' =>[
                             'bigtrans' =>2500,
                             'Driver' =>600,
                             'Assist' =>550
                            ],
                            'allowances' =>[200, 500, 700, 1200, 1700, 2200], 
                             'Allowance' =>[450, 500, 550, 1400, 1500, 1700, 2000],
                             'AssistAllowance' =>[300, 300, 300, 950, 1050, 1150, 1250]
                        ],
                      
                           'trailer_crane' =>[
                            'fuelRate' =>35,
                            'divisor' =>2.6,
                            'maintanance' => 3.74,
                            'fixcost' =>[
                             'bigtrans' =>4200,
                             'Driver' =>600,
                             'Assist' =>550
                        ],
                            'allowances' =>[200, 500, 700, 1200, 1700, 2200], 
                             'Allowance' =>[650, 700, 750, 1900, 2050, 2350, 2850],
                             'AssistAllowance' =>[300, 300, 300, 950, 1050, 1150, 1250]
                        ]
                        ];
                            // ส่งข้อมูลเป็น JSON
    header('Content-Type: application/json');
    echo json_encode($truckConfig);
    ?>



