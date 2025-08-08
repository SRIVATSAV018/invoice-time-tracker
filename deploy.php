<?php
namespace Deployer;

require 'recipe/laravel.php';

// Config

set('repository', 'git@github.com:marcomiddeldorff/invoice-time-tracker.git');

add('shared_files', []);
add('shared_dirs', []);
add('writable_dirs', []);

// Hosts

host('127.0.0.1')
    ->set('remote_user', 'my_user')
    ->set('deploy_path', 'my_path');

task('deploy:npm', function () {
    cd('{{release_path}}');
    run('npm install');
    run('npm run build');
});

after('deploy:update_code', 'deploy:npm');

// Hooks

after('deploy:failed', 'deploy:unlock');
