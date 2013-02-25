<?php

define('MAX_TMX_DIR_SIZE', 100 * 1024 * 1024); // 100 MB

// Adapted from:
// http://stackoverflow.com/questions/478121/php-get-directory-size
function dir_size($dir) {
    $total_size = 0;
    $filenames = scandir($dir);
    $cleaned_dir = rtrim($dir, '/') . '/';

    foreach ($filenames as $filename) {
        if ($filename === '.' || $filename === "..") continue;

        $file = $cleaned_dir . $filename;
        $size = is_dir($file) ? dir_size($file) : filesize($file);
        $total_size += $size;
    }

    return $total_size;
}

header('Content-Type: application/json');

$request = json_decode(file_get_contents('php://input'));

$tmp_dir = ini_get('upload_tmp_dir') ?: sys_get_temp_dir();
$tmp_dir = ini_get('upload_tmp_dir') ?: sys_get_temp_dir();
$tmx_dir = implode(DIRECTORY_SEPARATOR, array($tmp_dir, 'tmx'));
$map_dir = implode(DIRECTORY_SEPARATOR, array($tmx_dir, $request->id));
$tmxu_file = $map_dir . DIRECTORY_SEPARATOR . 'map.tmxu';

// Delete all content if TMX dir gets too big.
$tmx_dir_size = is_dir($tmx_dir) ? dir_size($tmx_dir) : 0;
if ($tmx_dir_size > MAX_TMX_DIR_SIZE) {
    error_log('Max TMX dir size exceeded: +' . ($tmx_dir_size - MAX_TMX_DIR_SIZE));
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($tmx_dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($files as $file) {
        $op = $file->isDir() ? 'rmdir' : 'unlink';
        $op($file->getRealPath());
    }
}

if ((is_dir($map_dir) || mkdir($map_dir, 0777, true)) && file_put_contents($tmxu_file, $request->xml)) {
    $response = array(
        'successful' => true
    );
} else {
    $response = array(
        'successful' => false,
        'message' => 'Could not persist map to disk'
    );
}

echo json_encode($response);